import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment';
import dotenv from 'dotenv';

dotenv.config();

const clearAppointments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa');
    console.log('Connected to MongoDB');

    // Delete all appointments
    const result = await Appointment.deleteMany({});
    console.log(`Deleted ${result.deletedCount} appointments`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearAppointments(); 