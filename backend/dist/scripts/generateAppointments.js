"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Appointment_1 = require("../models/Appointment");
const User_1 = require("../models/User");
const Service_1 = require("../models/Service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Helper function to get random date between two dates
const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
// Helper function to get random item from array
const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};
// Helper function to add minutes to date
const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};
const generateAppointments = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa');
        console.log('Connected to MongoDB');
        // Get all staff members
        const staff = await User_1.User.find({ role: 'staff' });
        if (staff.length === 0) {
            throw new Error('No staff members found in the database');
        }
        console.log(`Found ${staff.length} staff members`);
        // Get all customers
        const customers = await User_1.User.find({ role: 'customer' });
        if (customers.length === 0) {
            throw new Error('No customers found in the database');
        }
        console.log(`Found ${customers.length} customers`);
        // Get all services
        const services = await Service_1.Service.find({});
        if (services.length === 0) {
            throw new Error('No services found in the database');
        }
        console.log(`Found ${services.length} services`);
        // Generate appointments from March 1st to now
        const startDate = new Date('2024-03-01');
        const endDate = new Date();
        const appointments = [];
        // Generate appointments for each day
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6)
                continue;
            // Business hours: 9 AM to 6 PM
            const businessStart = new Date(date);
            businessStart.setHours(9, 0, 0, 0);
            const businessEnd = new Date(date);
            businessEnd.setHours(18, 0, 0, 0);
            // For each staff member
            for (const staffMember of staff) {
                // Generate 3-5 appointments per staff member per day
                const numAppointments = Math.floor(Math.random() * 3) + 3; // 3-5 appointments
                for (let i = 0; i < numAppointments; i++) {
                    // Random start time during business hours
                    const startTime = getRandomDate(businessStart, businessEnd);
                    // Get random service
                    const service = getRandomItem(services);
                    // Calculate end time based on service duration (assuming 30-60 minutes)
                    const duration = Math.floor(Math.random() * 30) + 30; // 30-60 minutes
                    const endTime = addMinutes(startTime, duration);
                    // Skip if appointment would end after business hours
                    if (endTime > businessEnd)
                        continue;
                    // Get random customer
                    const customer = getRandomItem(customers);
                    // Random status (80% completed, 15% confirmed, 5% cancelled)
                    const statusRandom = Math.random();
                    let status = 'confirmed';
                    if (statusRandom < 0.8)
                        status = 'completed';
                    else if (statusRandom < 0.95)
                        status = 'confirmed';
                    else
                        status = 'cancelled';
                    appointments.push({
                        customer: customer._id,
                        staff: staffMember._id,
                        service: service._id,
                        startTime,
                        endTime,
                        status,
                        notes: Math.random() < 0.3 ? 'Special request or note' : undefined
                    });
                }
            }
        }
        // Insert appointments in batches of 100
        const batchSize = 100;
        for (let i = 0; i < appointments.length; i += batchSize) {
            const batch = appointments.slice(i, i + batchSize);
            await Appointment_1.Appointment.insertMany(batch);
            console.log(`Inserted ${batch.length} appointments (${i + batch.length}/${appointments.length})`);
        }
        console.log('Successfully generated appointments');
        await mongoose_1.default.connection.close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
generateAppointments();
