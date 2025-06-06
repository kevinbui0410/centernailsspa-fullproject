import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'Eyelash Extensions' | 'Acrylic' | 'Facials' | 'Waxing' | 'Pedicure' | 'Manicure' | 'Liquid Gel (Hard Gel - UV Gel)' | 'Kids Service' | 'Other';
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 15, // minimum 15 minutes
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: [
      'Eyelash Extensions',
      'Acrylic',
      'Facials',
      'Waxing',
      'Pedicure',
      'Manicure',
      'Liquid Gel (Hard Gel - UV Gel)',
      'Kids Service',
      'Other'
    ],
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Service = mongoose.model<IService>('Service', serviceSchema); 