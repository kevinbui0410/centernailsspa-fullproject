import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const updateStaffImages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/centernailsspa');
    console.log('Connected to MongoDB');

    // Get all staff members
    const staff = await User.find({ role: 'staff' });
    console.log(`Found ${staff.length} staff members`);

    // Update each staff member with a default image URL
    for (const staffMember of staff) {
      const firstName = staffMember.firstName.toLowerCase();
      const lastName = staffMember.lastName.toLowerCase();
      const imageUrl = `/uploads/staff/${firstName}-${lastName}.jpg`;

      await User.findByIdAndUpdate(staffMember._id, { imageUrl });
      console.log(`Updated image URL for ${staffMember.firstName} ${staffMember.lastName}`);
    }

    console.log('Successfully updated staff images');
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateStaffImages(); 