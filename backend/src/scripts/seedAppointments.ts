import { connectDB } from '../config/db';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { addDays, addHours, setHours, setMinutes } from 'date-fns';

const seedAppointments = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing appointments
    await Appointment.deleteMany({});
    console.log('Cleared existing appointments');

    // Get all staff members
    const staffMembers = await User.find({ role: 'staff' });
    if (staffMembers.length === 0) {
      throw new Error('No staff members found. Please seed staff first.');
    }
    console.log(`Found ${staffMembers.length} staff members`);

    // Get all services
    const services = await Service.find({});
    if (services.length === 0) {
      throw new Error('No services found. Please seed services first.');
    }
    console.log(`Found ${services.length} services`);

    // Get all customers
    const customers = await User.find({ role: 'customer' });
    if (customers.length === 0) {
      throw new Error('No customers found. Please seed customers first.');
    }
    console.log(`Found ${customers.length} customers`);

    const appointments = [];
    const statuses = ['confirmed', 'completed', 'cancelled', 'no-show'];
    const startDate = new Date();
    startDate.setHours(8, 0, 0, 0); // Set to 8 AM

    // Generate appointments for the next 30 days
    for (let day = 0; day < 30; day++) {
      const currentDate = addDays(startDate, day);
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

      // Generate 8-10 appointments per day
      const appointmentsPerDay = Math.floor(Math.random() * 3) + 8;
      
      for (let i = 0; i < appointmentsPerDay; i++) {
        const service = services[Math.floor(Math.random() * services.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const staff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Generate random time between 8 AM and 8 PM
        const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
        const minute = Math.random() < 0.5 ? 0 : 30; // Either :00 or :30
        
        const appointmentTime = setMinutes(setHours(currentDate, hour), minute);
        const endTime = addHours(appointmentTime, 1); // Each appointment lasts 1 hour

        // Validate that all required fields are present
        if (!staff || !staff._id) {
          console.error('Invalid staff member:', staff);
          continue;
        }

        if (!service || !service._id) {
          console.error('Invalid service:', service);
          continue;
        }

        if (!customer || !customer._id) {
          console.error('Invalid customer:', customer);
          continue;
        }

        appointments.push({
          customer: customer._id,
          service: service._id,
          staff: staff._id,
          startTime: appointmentTime,
          endTime: endTime,
          status,
          notes: `Appointment for ${service.name} with ${staff?.firstName || 'Unknown'} ${staff?.lastName || ''}`,
          price: service.price
        });
      }
    }

    // Validate appointments before inserting
    const validAppointments = appointments.filter(app => 
      app.staff && 
      app.service && 
      app.customer && 
      app.startTime && 
      app.endTime
    );

    if (validAppointments.length !== appointments.length) {
      console.warn(`Filtered out ${appointments.length - validAppointments.length} invalid appointments`);
    }

    await Appointment.insertMany(validAppointments);
    console.log(`Seeded ${validAppointments.length} appointments successfully`);

    // Verify all appointments have staff
    const unassignedAppointments = await Appointment.find({ staff: { $exists: false } });
    if (unassignedAppointments.length > 0) {
      console.error(`Found ${unassignedAppointments.length} appointments without staff!`);
    } else {
      console.log('All appointments have staff assigned.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding appointments:', error);
    process.exit(1);
  }
};

seedAppointments(); 