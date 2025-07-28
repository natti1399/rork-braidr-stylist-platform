import mongoose, { Document, Schema } from 'mongoose';

export interface IStylist extends Document {
  _id: string;
  userId: string;
  businessName?: string;
  bio: string;
  specialties: string[];
  experience: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  serviceArea: number; // radius in miles
  portfolio: string[]; // array of image URLs
  rating: number;
  reviewCount: number;
  totalBookings: number;
  isVerified: boolean;
  isAvailable: boolean;
  languages: string[];
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  responseTime: number; // average response time in minutes
  features: string[]; // e.g., ['home_service', 'late_hours', 'child_friendly']
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }
});

const WorkingHoursSchema = new Schema({
  start: { type: String, default: '09:00' },
  end: { type: String, default: '17:00' },
  isWorking: { type: Boolean, default: false }
});

const StylistSchema = new Schema<IStylist>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User',
    index: true
  },
  businessName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    required: true,
    maxlength: 500
  },
  specialties: [{
    type: String,
    required: true,
    enum: [
      'Box Braids', 'Knotless Braids', 'Goddess Braids', 'Jumbo Braids',
      'Twist Braids', 'Cornrows', 'French Braids', 'Dutch Braids',
      'Fulani Braids', 'Lemonade Braids', 'Passion Twists', 'Spring Twists'
    ]
  }],
  experience: {
    type: String,
    required: true,
    enum: ['1-2 years', '3-5 years', '5+ years', '10+ years']
  },
  location: {
    type: LocationSchema,
    required: true
  },
  serviceArea: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 25
  },
  portfolio: [{
    type: String, // Image URLs
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Portfolio images must be valid image URLs'
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  languages: [{
    type: String,
    default: ['English']
  }],
  workingHours: {
    monday: { type: WorkingHoursSchema, default: () => ({}) },
    tuesday: { type: WorkingHoursSchema, default: () => ({}) },
    wednesday: { type: WorkingHoursSchema, default: () => ({}) },
    thursday: { type: WorkingHoursSchema, default: () => ({}) },
    friday: { type: WorkingHoursSchema, default: () => ({}) },
    saturday: { type: WorkingHoursSchema, default: () => ({}) },
    sunday: { type: WorkingHoursSchema, default: () => ({}) }
  },
  responseTime: {
    type: Number,
    default: 60, // 1 hour in minutes
    min: 0
  },
  features: [{
    type: String,
    enum: [
      'home_service', 'late_hours', 'weekend_available', 'child_friendly',
      'verified_photos', 'quick_response', 'same_day_booking', 'accepts_walkins'
    ]
  }]
}, {
  timestamps: true
});

// Indexes for search and performance
StylistSchema.index({ 'location.coordinates': '2dsphere' });
StylistSchema.index({ specialties: 1, isAvailable: 1 });
StylistSchema.index({ rating: -1, reviewCount: -1 });
StylistSchema.index({ isVerified: 1, isAvailable: 1 });
StylistSchema.index({ createdAt: -1 });

export const Stylist = mongoose.model<IStylist>('Stylist', StylistSchema);