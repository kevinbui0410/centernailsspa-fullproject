import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IService } from './Service';

export interface IAppointment extends Document {
  customer: IUser['_id'];
  staff: IUser['_id'];
  service: IService['_id'];
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
appointmentSchema.index({ startTime: 1, staff: 1 });
appointmentSchema.index({ customer: 1, status: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema); 