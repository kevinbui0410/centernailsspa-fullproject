"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Appointment_1 = require("../models/Appointment");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const clearAppointments = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa');
        console.log('Connected to MongoDB');
        // Delete all appointments
        const result = await Appointment_1.Appointment.deleteMany({});
        console.log(`Deleted ${result.deletedCount} appointments`);
        // Close the connection
        await mongoose_1.default.connection.close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
clearAppointments();
