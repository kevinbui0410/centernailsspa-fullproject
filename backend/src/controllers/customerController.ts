import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// Get all customers with pagination
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search ? {
      role: 'customer',
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    } : { role: 'customer' };

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    // Get paginated customers
    const customers = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// Get a single customer
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' })
      .select('-password');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if customer already exists
    const existingCustomer = await User.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const customer = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'customer'
    });

    await customer.save();

    // Return customer without password
    const customerResponse = customer.toObject();
    const { password: _, ...customerWithoutPassword } = customerResponse;

    res.status(201).json(customerWithoutPassword);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

// Update a customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const updateData: any = { firstName, lastName, email, phone };

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

// Delete a customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'customer' 
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
}; 