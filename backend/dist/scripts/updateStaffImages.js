"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const updateStaffImages = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa');
        console.log('Connected to MongoDB');
        // Get all staff members
        const staff = await User_1.User.find({ role: 'staff' });
        console.log(`Found ${staff.length} staff members`);
        // Update each staff member with a default image URL
        for (const staffMember of staff) {
            const firstName = staffMember.firstName.toLowerCase();
            const lastName = staffMember.lastName.toLowerCase();
            const imageUrl = `/uploads/staff/${firstName}-${lastName}.jpg`;
            await User_1.User.findByIdAndUpdate(staffMember._id, { imageUrl });
            console.log(`Updated image URL for ${staffMember.firstName} ${staffMember.lastName}`);
        }
        console.log('Successfully updated staff images');
        await mongoose_1.default.connection.close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
updateStaffImages();
