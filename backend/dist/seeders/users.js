"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Service_1 = require("../models/Service");
dotenv_1.default.config();
// Generate random phone number
const generatePhoneNumber = () => {
    return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
};
// Generate random email
const generateEmail = (firstName, lastName) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
};
// Admin data
const adminData = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@centernailsspa.com",
    password: "Admin123!",
    phone: generatePhoneNumber(),
    role: "admin",
    status: "active",
    imageUrl: "/uploads/admin/admin-user.jpg"
};
// Staff data
const staffData = [
    {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@centernailsspa.com",
        password: "Staff123!",
        phone: generatePhoneNumber(),
        role: "staff",
        status: "active",
        imageUrl: "/uploads/staff/sarah-johnson.jpg",
        services: [] // Will be populated with service IDs
    },
    {
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@centernailsspa.com",
        password: "Staff123!",
        phone: generatePhoneNumber(),
        role: "staff",
        status: "active",
        imageUrl: "/uploads/staff/michael-chen.jpg",
        services: []
    },
    {
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@centernailsspa.com",
        password: "Staff123!",
        phone: generatePhoneNumber(),
        role: "staff",
        status: "active",
        imageUrl: "/uploads/staff/emily-rodriguez.jpg",
        services: []
    },
    {
        firstName: "David",
        lastName: "Kim",
        email: "david.kim@centernailsspa.com",
        password: "Staff123!",
        phone: generatePhoneNumber(),
        role: "staff",
        status: "active",
        imageUrl: "/uploads/staff/david-kim.jpg",
        services: []
    },
    {
        firstName: "Lisa",
        lastName: "Patel",
        email: "lisa.patel@centernailsspa.com",
        password: "Staff123!",
        phone: generatePhoneNumber(),
        role: "staff",
        status: "active",
        imageUrl: "/uploads/staff/lisa-patel.jpg",
        services: []
    }
];
// Generate 50 random customers
const generateCustomers = () => {
    const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "James", "Isabella", "Benjamin"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    const customers = [];
    const usedEmails = new Set();
    let attempts = 0;
    while (customers.length < 50 && attempts < 500) { // limit attempts to avoid infinite loop
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = generateEmail(firstName, lastName);
        if (!usedEmails.has(email)) {
            customers.push({
                firstName,
                lastName,
                email,
                password: "Customer123!",
                phone: generatePhoneNumber(),
                role: "customer"
            });
            usedEmails.add(email);
        }
        attempts++;
    }
    return customers;
};
const seedUsers = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa';
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Get all services
        const services = await Service_1.Service.find({});
        const serviceIds = services.map(service => service._id);
        // Assign random services to each staff member
        staffData.forEach(staff => {
            // Assign random services to staff
            const randomServices = new Set();
            const numServices = Math.floor(Math.random() * 3) + 2; // 2-4 services per staff
            while (randomServices.size < numServices) {
                const randomService = services[Math.floor(Math.random() * services.length)];
                randomServices.add(randomService._id);
            }
            staff.services = Array.from(randomServices);
        });
        // Clear existing users
        await User_1.User.deleteMany({});
        console.log('Cleared existing users');
        // Insert admin
        await User_1.User.create(adminData);
        console.log('Successfully seeded admin user');
        // Insert staff
        await User_1.User.insertMany(staffData);
        console.log('Successfully seeded staff');
        // Insert customers
        const customers = generateCustomers();
        await User_1.User.insertMany(customers);
        console.log('Successfully seeded customers');
        // Disconnect from MongoDB
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};
// Run the seeder
seedUsers();
