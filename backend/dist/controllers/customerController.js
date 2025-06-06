"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getCustomers = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get all customers with pagination
const getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
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
        const total = await User_1.User.countDocuments(searchQuery);
        // Get paginated customers
        const customers = await User_1.User.find(searchQuery)
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
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
};
exports.getCustomers = getCustomers;
// Get a single customer
const getCustomer = async (req, res) => {
    try {
        const customer = await User_1.User.findOne({ _id: req.params.id, role: 'customer' })
            .select('-password');
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    }
    catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Error fetching customer' });
    }
};
exports.getCustomer = getCustomer;
// Create a new customer
const createCustomer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        // Check if customer already exists
        const existingCustomer = await User_1.User.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Customer with this email already exists' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create new customer
        const customer = new User_1.User({
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
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Error creating customer' });
    }
};
exports.createCustomer = createCustomer;
// Update a customer
const updateCustomer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const updateData = { firstName, lastName, email, phone };
        // If password is provided, hash it
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            updateData.password = await bcryptjs_1.default.hash(password, salt);
        }
        const customer = await User_1.User.findOneAndUpdate({ _id: req.params.id, role: 'customer' }, { $set: updateData }, { new: true }).select('-password');
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    }
    catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer' });
    }
};
exports.updateCustomer = updateCustomer;
// Delete a customer
const deleteCustomer = async (req, res) => {
    try {
        const customer = await User_1.User.findOneAndDelete({
            _id: req.params.id,
            role: 'customer'
        });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Error deleting customer' });
    }
};
exports.deleteCustomer = deleteCustomer;
