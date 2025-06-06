"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Service_1 = require("../models/Service");
dotenv_1.default.config();
const services = [
    {
        name: "Eyelash Extension Full Set",
        description: "Full set of eyelash extensions for a dramatic look",
        duration: 90,
        price: 80,
        category: "Eyelash Extensions",
        isActive: true
    },
    {
        name: "Eyelash Extension Refill",
        description: "Refill for existing eyelash extensions",
        duration: 45,
        price: 50,
        category: "Eyelash Extensions",
        isActive: true
    },
    {
        name: "Dip Powder",
        description: "Dip powder nail application for long-lasting wear",
        duration: 45,
        price: 45,
        category: "Acrylic",
        isActive: true
    },
    {
        name: "Facials",
        description: "Complete facial treatment for skin rejuvenation",
        duration: 45,
        price: 50,
        category: "Facials",
        isActive: true
    },
    {
        name: "Back Facial",
        description: "Specialized facial treatment for back skin",
        duration: 30,
        price: 30,
        category: "Facials",
        isActive: true
    },
    {
        name: "Back Wax",
        description: "Complete back waxing service",
        duration: 45,
        price: 30,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Half Leg Wax",
        description: "Lower leg waxing service",
        duration: 15,
        price: 25,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Full Leg Wax",
        description: "Complete leg waxing service",
        duration: 15,
        price: 45,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Full Arm Wax",
        description: "Complete arm waxing service",
        duration: 15,
        price: 25,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Half Arm Wax",
        description: "Lower arm waxing service",
        duration: 15,
        price: 15,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Facial Wax",
        description: "Complete facial waxing service",
        duration: 30,
        price: 28,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Under Arm Wax",
        description: "Underarm waxing service",
        duration: 15,
        price: 15,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Brazilian Wax",
        description: "Complete Brazilian waxing service",
        duration: 45,
        price: 45,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Class Pedicure",
        description: "Classic pedicure service",
        duration: 30,
        price: 30,
        category: "Pedicure",
        isActive: true
    },
    {
        name: "Gel Manicure + Pedicure",
        description: "Combined gel manicure and pedicure service",
        duration: 60,
        price: 65,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Dip Manicure + Pedicure",
        description: "Combined dip powder manicure and pedicure service",
        duration: 90,
        price: 80,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Gel X",
        description: "Gel X nail extension service",
        duration: 60,
        price: 60,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Builder Gel",
        description: "Builder gel application service",
        duration: 45,
        price: 45,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Acrylic Full Set",
        description: "Complete acrylic nail set",
        duration: 60,
        price: 60,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Acrylic Fill",
        description: "Acrylic nail fill service",
        duration: 45,
        price: 45,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Regular Manicure + Pedicure",
        description: "Combined regular manicure and pedicure service",
        duration: 60,
        price: 53,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Dip Manicure",
        description: "Dip powder manicure service",
        duration: 45,
        price: 45,
        category: "Manicure",
        isActive: true
    },
    {
        name: "Full Set Gel Polish",
        description: "Complete gel polish application",
        duration: 45,
        price: 45,
        category: "Liquid Gel (Hard Gel - UV Gel)",
        isActive: true
    },
    {
        name: "Eyebrow Wax",
        description: "Eyebrow shaping and waxing",
        duration: 15,
        price: 12,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Teeny Manicure & Pedicure",
        description: "Special manicure and pedicure service for kids",
        duration: 30,
        price: 35,
        category: "Kids Service",
        isActive: true
    },
    {
        name: "Manicure + Pedicure",
        description: "Combined manicure and pedicure service",
        duration: 15,
        price: 0,
        category: "Other",
        isActive: true
    },
    {
        name: "Acrylic/SNS Soak Off",
        description: "Acrylic or SNS nail removal service",
        duration: 15,
        price: 8,
        category: "Other",
        isActive: true
    },
    {
        name: "Bikini Wax",
        description: "Bikini line waxing service",
        duration: 45,
        price: 45,
        category: "Waxing",
        isActive: true
    },
    {
        name: "Fill With Gel Polish",
        description: "Gel polish fill service",
        duration: 45,
        price: 40,
        category: "Liquid Gel (Hard Gel - UV Gel)",
        isActive: true
    }
];
const seedServices = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa';
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Clear existing services
        await Service_1.Service.deleteMany({});
        console.log('Cleared existing services');
        // Insert new services
        await Service_1.Service.insertMany(services);
        console.log('Successfully seeded services');
        // Disconnect from MongoDB
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('Error seeding services:', error);
        process.exit(1);
    }
};
// Run the seeder
seedServices();
