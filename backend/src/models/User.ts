import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface WorkingHours {
  weekday: {
    start: string; // format: "HH:mm"
    end: string;
  };
  saturday: {
    start: string;
    end: string;
  };
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  status: 'active' | 'inactive';
  imageUrl?: string;
  workingHours?: WorkingHours;
  services?: mongoose.Types.ObjectId[]; // References to services this staff member can perform
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const workingHoursSchema = new Schema<WorkingHours>({
  weekday: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "21:00" }
  },
  saturday: {
    start: { type: String, default: "10:00" },
    end: { type: String, default: "19:00" }
  }
});

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'staff', 'admin'],
    default: 'customer',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  workingHours: {
    type: workingHoursSchema,
    default: () => ({
      weekday: { start: "09:00", end: "21:00" },
      saturday: { start: "10:00", end: "19:00" }
    })
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }]
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 