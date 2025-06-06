"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.deleteService = exports.updateService = exports.createService = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.deleteStaff = exports.updateStaff = exports.createStaff = exports.getAppointments = exports.getStaff = exports.getUsers = exports.getServices = exports.getDashboardStats = void 0;
const Service_1 = require("../models/Service");
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
const getDashboardStats = async (req, res) => {
    try {
        // Get total appointments
        const totalAppointments = await Appointment_1.Appointment.countDocuments();
        // Get total customers
        const totalCustomers = await User_1.User.countDocuments({ role: 'customer' });
        // Get total revenue
        const appointments = await Appointment_1.Appointment.find().populate('service');
        const totalRevenue = appointments.reduce((sum, appointment) => {
            var _a;
            return sum + (((_a = appointment.service) === null || _a === void 0 ? void 0 : _a.price) || 0);
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
        const appointmentsByDate = await Appointment_1.Appointment.aggregate([
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
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};
exports.getDashboardStats = getDashboardStats;
const getServices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const query = {};
        if (category) {
            query.category = category;
        }
        const [services, total] = await Promise.all([
            Service_1.Service.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Service_1.Service.countDocuments(query)
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching services', error });
    }
};
exports.getServices = getServices;
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const search = req.query.search || '';
        const sortField = req.query.sortField || 'name';
        const sortDirection = req.query.sortDirection || 'asc';
        const skip = (page - 1) * limit;
        // Build search query
        const searchQuery = { role: 'customer' };
        if (search) {
            searchQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        // Build sort query
        const sortQuery = {};
        sortQuery[sortField] = sortDirection === 'asc' ? 1 : -1;
        const [users, total] = await Promise.all([
            User_1.User.find(searchQuery)
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .select('-password'),
            User_1.User.countDocuments(searchQuery)
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
    }
    catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};
exports.getUsers = getUsers;
const getStaff = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [staff, total] = await Promise.all([
            User_1.User.find({ role: 'staff' })
                .populate('services')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User_1.User.countDocuments({ role: 'staff' })
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching staff', error });
    }
};
exports.getStaff = getStaff;
const getAppointments = async (req, res) => {
    try {
        console.log('Received request for appointments with query:', req.query);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const sortField = req.query.sortField || 'startTime';
        const sortDirection = req.query.sortDirection || 'desc';
        const month = req.query.month || (() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        })();
        const staffId = req.query.staffId || '';
        const status = req.query.status || '';
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
        const searchQuery = search ? {
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
        const sortQuery = {};
        if (sortField === 'customer') {
            sortQuery['customer.name'] = sortDirection === 'asc' ? 1 : -1;
        }
        else if (sortField === 'service') {
            sortQuery['service.name'] = sortDirection === 'asc' ? 1 : -1;
        }
        else if (sortField === 'staff') {
            sortQuery['staff.name'] = sortDirection === 'asc' ? 1 : -1;
        }
        else {
            sortQuery[sortField] = sortDirection === 'asc' ? 1 : -1;
        }
        console.log('Sort query:', sortQuery);
        // Get total count for pagination
        const total = await Appointment_1.Appointment.countDocuments(searchQuery);
        console.log('Total appointments found:', total);
        // Get paginated appointments
        const appointments = await Appointment_1.Appointment.find(searchQuery)
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
            const staff = appointment.staff;
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
    }
    catch (error) {
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
exports.getAppointments = getAppointments;
// Staff CRUD
const createStaff = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, services } = req.body;
        const staff = new User_1.User({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating staff member', error });
    }
};
exports.createStaff = createStaff;
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, services, status, imageUrl } = req.body;
        const staff = await User_1.User.findByIdAndUpdate(id, { firstName, lastName, email, phone, services, status, imageUrl }, { new: true });
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating staff member', error });
    }
};
exports.updateStaff = updateStaff;
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await User_1.User.findByIdAndDelete(id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        res.json({ message: 'Staff member deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting staff member', error });
    }
};
exports.deleteStaff = deleteStaff;
// Customer CRUD
const createCustomer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        const customer = new User_1.User({
            firstName,
            lastName,
            email,
            phone,
            role: 'customer',
            status: 'active'
        });
        await customer.save();
        res.status(201).json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating customer', error });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, status } = req.body;
        const customer = await User_1.User.findByIdAndUpdate(id, { firstName, lastName, email, phone, status }, { new: true });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating customer', error });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await User_1.User.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};
exports.deleteCustomer = deleteCustomer;
// Service CRUD
const createService = async (req, res) => {
    try {
        const { name, description, price, duration, category } = req.body;
        const service = new Service_1.Service({
            name,
            description,
            price,
            duration,
            category
        });
        await service.save();
        res.status(201).json(service);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating service', error });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, category } = req.body;
        const service = await Service_1.Service.findByIdAndUpdate(id, { name, description, price, duration, category }, { new: true });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating service', error });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service_1.Service.findByIdAndDelete(id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting service', error });
    }
};
exports.deleteService = deleteService;
// Appointment CRUD
const createAppointment = async (req, res) => {
    try {
        const { customer, service, staff, startTime, endTime, status } = req.body;
        const appointment = new Appointment_1.Appointment({
            customer,
            service,
            staff,
            startTime,
            endTime,
            status
        });
        await appointment.save();
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating appointment', error });
    }
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { customer, service, staff, startTime, endTime, status } = req.body;
        const appointment = await Appointment_1.Appointment.findByIdAndUpdate(id, { customer, service, staff, startTime, endTime, status }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating appointment', error });
    }
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment_1.Appointment.findByIdAndDelete(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting appointment', error });
    }
};
exports.deleteAppointment = deleteAppointment;
