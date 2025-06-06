"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStaffOrSelf = exports.isStaff = exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.status !== 'active') {
            return res.status(403).json({ message: 'User account is inactive' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};
exports.isAdmin = isAdmin;
const isStaff = (req, res, next) => {
    var _a, _b;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'staff' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Staff privileges required.' });
    }
    next();
};
exports.isStaff = isStaff;
const isStaffOrSelf = (req, res, next) => {
    var _a, _b, _c;
    const requestedUserId = req.params.id;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin') {
        return next();
    }
    if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'staff') {
        return next();
    }
    if (((_c = req.user) === null || _c === void 0 ? void 0 : _c._id.toString()) === requestedUserId) {
        return next();
    }
    return res.status(403).json({ message: 'Access denied' });
};
exports.isStaffOrSelf = isStaffOrSelf;
