import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  bookingId: string; // unique booking reference
  appointmentDate: Date;
  startTime: string; // e.g., "10:00"
  endTime: string; // e.g., "14:00"
  duration: number; // duration in minutes
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    notes?: string;
  };
  contactNumber: string;
  totalPrice: number;
  addOns: {
    id: string;
    name: string;
    price: number;
  }[];
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'stylist';
  cancelledAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  notes: { type: String, maxlength: 200 }
});

const AddOnSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 }
});

const AppointmentSchema = new Schema<IAppointment>({
  customerId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  stylistId: {
    type: String,
    required: true,
    ref: 'Stylist',
    index: true
  },
  serviceId: {
    type: String,
    required: true,
    ref: 'Service',
    index: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 720 // 12 hours max
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  location: {
    type: LocationSchema,
    required: true
  },
  contactNumber: {
    type: String,
    required: true,
    match: /^\+?[\d\s\-\(\)]+$/
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  addOns: [AddOnSchema],
  specialRequests: {
    type: String,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    maxlength: 300
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'stylist']
  },
  cancelledAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance and common queries
AppointmentSchema.index({ customerId: 1, appointmentDate: -1 });
AppointmentSchema.index({ stylistId: 1, appointmentDate: -1 });
AppointmentSchema.index({ appointmentDate: 1, status: 1 });
AppointmentSchema.index({ status: 1, createdAt: -1 });
AppointmentSchema.index({ bookingId: 1 });

// Compound indexes for conflict checking
AppointmentSchema.index({ 
  stylistId: 1, 
  appointmentDate: 1, 
  startTime: 1, 
  status: 1 
});

// Index for reminder jobs
AppointmentSchema.index({ 
  appointmentDate: 1, 
  reminderSent: 1, 
  status: 1 
});

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);