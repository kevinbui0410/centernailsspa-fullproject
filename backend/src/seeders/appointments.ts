import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { Service } from '../models/Service';

dotenv.config();

// Helper function to add minutes to a date
const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000);
};

// Helper function to check if a time is within working hours
const isWithinWorkingHours = (date: Date, workingHours: any) => {
  const dayOfWeek = date.getDay();
  const timeString = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  if (dayOfWeek === 6) { // Saturday
    return timeString >= workingHours.saturday.start && timeString <= workingHours.saturday.end;
  } else if (dayOfWeek !== 0) { // Weekday (not Sunday)
    return timeString >= workingHours.weekday.start && timeString <= workingHours.weekday.end;
  }
  return false; // Sunday
};

// Helper function to generate random time within working hours
const generateRandomTime = (date: Date, workingHours: any) => {
  const dayOfWeek = date.getDay();
  const hours = dayOfWeek === 6 ? workingHours.saturday : workingHours.weekday;
  
  const [startHour, startMinute] = hours.start.split(':').map(Number);
  const [endHour, endMinute] = hours.end.split(':').map(Number);
  
  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const randomTime = new Date(startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime()));
  return randomTime;
};

// Helper function to check if staff is available
const isStaffAvailable = async (
  staffId: mongoose.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  existingAppointments: any[]
) => {
  return !existingAppointments.some(appointment => 
    appointment.staff.toString() === staffId.toString() &&
    ((startTime >= appointment.startTime && startTime < appointment.endTime) ||
     (endTime > appointment.startTime && endTime <= appointment.endTime) ||
     (startTime <= appointment.startTime && endTime >= appointment.endTime))
  );
};

const generateAppointments = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all staff and their services
    const staff = await User.find({ role: 'staff' }).populate('services');
    const customers = await User.find({ role: 'customer' });
    const services = await Service.find({});

    // Clear existing appointments
    await Appointment.deleteMany({});
    console.log('Cleared existing appointments');

    const appointments = [];
    const startDate = new Date('2024-03-01');
    const endDate = new Date();
    const currentDate = new Date(startDate);

    // For each staff, fetch their full service documents
    const staffWithServices = await Promise.all(staff.map(async (staffMember: any) => {
      const populatedStaff = staffMember.toObject();
      populatedStaff.services = await Service.find({ _id: { $in: staffMember.services || [] } });
      return populatedStaff;
    }));

    while (currentDate <= endDate) {
      // Skip Sundays
      if (currentDate.getDay() !== 0) {
        // Generate 8-15 appointments for each day
        const numAppointments = Math.floor(Math.random() * 8) + 8;
        const dayAppointments = [];

        for (let i = 0; i < numAppointments; i++) {
          // Pick a random staff member
          const staffMember = staffWithServices[Math.floor(Math.random() * staffWithServices.length)];
          // Ensure services is always an array
          const availableServices = (staffMember.services || []).filter((service: any) => !!service);
          if (availableServices.length === 0) continue;
          // Pick a random service
          const service = availableServices[Math.floor(Math.random() * availableServices.length)];
          
          // Generate random start time within working hours
          const startTime = generateRandomTime(currentDate, staffMember.workingHours);
          const endTime = addMinutes(startTime, service.duration);

          // Check if the appointment is within working hours
          if (isWithinWorkingHours(startTime, staffMember.workingHours) && 
              isWithinWorkingHours(endTime, staffMember.workingHours)) {
            
            // Select random customer
            const customer = customers[Math.floor(Math.random() * customers.length)];

            // Randomly assign status (mostly completed for past dates)
            const status = currentDate < new Date() ? 
              ['completed', 'completed', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] :
              ['pending', 'confirmed'][Math.floor(Math.random() * 2)];

            dayAppointments.push({
              customer: customer._id,
              staff: staffMember._id,
              service: service._id,
              startTime,
              endTime,
              status,
              notes: Math.random() > 0.7 ? 'Special request or note' : undefined
            });
          }
        }

        // Add appointments to the main array
        appointments.push(...dayAppointments);
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert all appointments
    await Appointment.insertMany(appointments);
    console.log(`Successfully seeded ${appointments.length} appointments`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding appointments:', error);
    process.exit(1);
  }
};

// Run the seeder
generateAppointments(); 