import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get total appointments
    const totalAppointments = await Appointment.countDocuments();

    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Get total revenue
    const appointments = await Appointment.find().populate('service');
    const totalRevenue = appointments.reduce((sum, appointment) => {
      return sum + (appointment.service?.price || 0);
    }, 0);

    // Calculate average appointment duration
    const totalDuration = appointments.reduce((sum, appointment) => {
      const start = new Date(appointment.startTime);
      const end = new Date(appointment.endTime);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
    }, 0);
    const averageAppointmentDuration = totalAppointments > 0 
      ? Math.round(totalDuration / totalAppointments) 
      : 0;

    // Get appointments by date for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appointmentsByDate = await Appointment.aggregate([
      {
        $match: {
          startTime: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Transform the data for the chart
    const chartData = appointmentsByDate.map(item => ({
      date: item._id,
      count: item.count
    }));

    res.json({
      totalAppointments,
      totalCustomers,
      totalRevenue,
      averageAppointmentDuration,
      appointmentsByDate: chartData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;

    const query: any = {};
    if (category) {
      query.category = category;
    }

    const [services, total] = await Promise.all([
      Service.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Service.countDocuments(query)
    ]);

    res.json({
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const search = req.query.search as string || '';
    const sortField = (req.query.sortField as string) || 'name';
    const sortDirection = (req.query.sortDirection as string) || 'asc';

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = { role: 'customer' };
    if (search) {
      searchQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sortQuery: any = {};
    sortQuery[sortField] = sortDirection === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(searchQuery)
    ]);

    // Transform users to include full name
    const transformedUsers = users.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getStaff = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      User.find({ role: 'staff' })
        .populate('services')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ role: 'staff' })
    ]);

    // Transform staff data to include full name
    const transformedStaff = staff.map(staffMember => ({
      _id: staffMember._id,
      name: `${staffMember.firstName} ${staffMember.lastName}`,
      services: staffMember.services
    }));

    res.json({
      staff: transformedStaff,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    console.log('Received request for appointments with query:', req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string || '';
    const sortField = req.query.sortField as string || 'startTime';
    const sortDirection = req.query.sortDirection as string || 'desc';
    const month = req.query.month as string || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();
    const staffId = req.query.staffId as string || '';
    const status = req.query.status as string || '';

    console.log('Processed query parameters:', {
      page,
      limit,
      skip,
      search,
      sortField,
      sortDirection,
      month,
      staffId,
      status
    });

    // Build search query
    const searchQuery: any = search ? {
      $or: [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'service.name': { $regex: search, $options: 'i' } },
        { 'staff.name': { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Add month filter if provided
    const [year, monthNum] = month.split('-').map(Number);
    if (!isNaN(year) && !isNaN(monthNum)) {
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 1);
      searchQuery.startTime = { $gte: start, $lt: end };
    }

    // Add staff filter if provided
    if (staffId) {
      searchQuery.staff = staffId;
    }

    // Add status filter if provided
    if (status) {
      searchQuery.status = status;
    }

    console.log('Final search query:', searchQuery);

    // Build sort object
    const sortQuery: any = {};
    if (sortField === 'customer') {
      sortQuery['customer.name'] = sortDirection === 'asc' ? 1 : -1;
    } else if (sortField === 'service') {
      sortQuery['service.name'] = sortDirection === 'asc' ? 1 : -1;
    } else if (sortField === 'staff') {
      sortQuery['staff.name'] = sortDirection === 'asc' ? 1 : -1;
    } else {
      sortQuery[sortField] = sortDirection === 'asc' ? 1 : -1;
    }

    console.log('Sort query:', sortQuery);

    // Get total count for pagination
    const total = await Appointment.countDocuments(searchQuery);
    console.log('Total appointments found:', total);

    // Get paginated appointments
    const appointments = await Appointment.find(searchQuery)
      .populate('customer', 'firstName lastName email')
      .populate('service', 'name price')
      .populate('staff', 'firstName lastName')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Found appointments:', appointments.length);

    // Transform staff data to include full name
    const transformedAppointments = appointments.map(appointment => {
      const staff = appointment.staff as any;
      return {
        ...appointment,
        staff: staff ? {
          _id: staff._id,
          name: staff.firstName && staff.lastName ? `${staff.firstName} ${staff.lastName}` : undefined
        } : null
      };
    });

    res.json({
      appointments: transformedAppointments || [],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments',
      appointments: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    });
  }
};

// Staff CRUD
export const createStaff = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, services } = req.body;
    const staff = new User({
      firstName,
      lastName,
      email,
      phone,
      services,
      role: 'staff',
      status: 'active'
    });
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error creating staff member', error });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, services, status, imageUrl } = req.body;
    const staff = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone, services, status, imageUrl },
      { new: true }
    );
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff member', error });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await User.findByIdAndDelete(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff member', error });
  }
};

// Customer CRUD
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const customer = new User({
      firstName,
      lastName,
      email,
      phone,
      role: 'customer',
      status: 'active'
    });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer', error });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, status } = req.body;
    const customer = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone, status },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await User.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error });
  }
};

// Service CRUD
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration, category } = req.body;
    const service = new Service({
      name,
      description,
      price,
      duration,
      category
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, category } = req.body;
    const service = await Service.findByIdAndUpdate(
      id,
      { name, description, price, duration, category },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error });
  }
};

// Appointment CRUD
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { customer, service, staff, startTime, endTime, status } = req.body;
    const appointment = new Appointment({
      customer,
      service,
      staff,
      startTime,
      endTime,
      status
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customer, service, staff, startTime, endTime, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { customer, service, staff, startTime, endTime, status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
}; 