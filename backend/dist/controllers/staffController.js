"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffServices = exports.getStaffById = exports.getAllStaff = void 0;
const User_1 = require("../models/User");
const getAllStaff = async (req, res) => {
    try {
        const staff = await User_1.User.find({ role: 'staff' }).populate('services');
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching staff', error });
    }
};
exports.getAllStaff = getAllStaff;
const getStaffById = async (req, res) => {
    try {
        const staff = await User_1.User.findOne({ _id: req.params.id, role: 'staff' }).populate('services');
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching staff', error });
    }
};
exports.getStaffById = getStaffById;
const getStaffServices = async (req, res) => {
    try {
        const staff = await User_1.User.findOne({ _id: req.params.id, role: 'staff' }).populate('services');
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json(staff.services);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching staff services', error });
    }
};
exports.getStaffServices = getStaffServices;
