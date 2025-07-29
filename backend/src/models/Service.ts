import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  _id: string;
  stylistId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: string; // e.g., "4-6 hours"
  durationMinutes: number; // duration in minutes for calculations
  image: string;
  isActive: boolean;
  bookingCount: number;
  addOns: {
    id: string;
    name: string;
    description: string;
    price: number;
  }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AddOnSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const ServiceSchema = new Schema<IService>({
  stylistId: {
    type: String,
    required: true,
    ref: 'Stylist',
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Box Braids', 'Knotless Braids', 'Goddess Braids', 'Jumbo Braids',
      'Twist Braids', 'Cornrows', 'French Braids', 'Dutch Braids',
      'Fulani Braids', 'Lemonade Braids', 'Passion Twists', 'Spring Twists'
    ],
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true,
    match: /^\d+-\d+ hours?$|^\d+ hours?$/
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 30,
    max: 720 // 12 hours max
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Service image must be a valid image URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  bookingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  addOns: [AddOnSchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Indexes for search and performance
ServiceSchema.index({ stylistId: 1, isActive: 1 });
ServiceSchema.index({ category: 1, isActive: 1 });
ServiceSchema.index({ price: 1 });
ServiceSchema.index({ bookingCount: -1 });
ServiceSchema.index({ tags: 1 });
ServiceSchema.index({ createdAt: -1 });

// Compound indexes for common queries
ServiceSchema.index({ stylistId: 1, category: 1, isActive: 1 });
ServiceSchema.index({ category: 1, price: 1, isActive: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);