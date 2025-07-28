import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  customerId: string;
  stylistId: string;
  appointmentId: string;
  overallRating: number;
  categoryRatings: {
    quality: number;
    timeliness: number;
    professionalism: number;
    cleanliness: number;
    communication: number;
  };
  reviewText: string;
  photos: string[];
  isAnonymous: boolean;
  helpfulCount: number;
  helpfulVotes: string[]; // array of user IDs who voted helpful
  isVerified: boolean; // verified as genuine appointment
  response?: {
    text: string;
    respondedAt: Date;
  };
  isReported: boolean;
  reportReasons: string[];
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryRatingsSchema = new Schema({
  quality: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  timeliness: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  professionalism: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  cleanliness: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  communication: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  }
});

const ResponseSchema = new Schema({
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  respondedAt: {
    type: Date,
    default: Date.now
  }
});

const ReviewSchema = new Schema<IReview>({
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
  appointmentId: {
    type: String,
    required: true,
    ref: 'Appointment',
    unique: true, // one review per appointment
    index: true
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  categoryRatings: {
    type: CategoryRatingsSchema,
    required: true
  },
  reviewText: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  photos: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Review photos must be valid image URLs'
    }
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulVotes: [{
    type: String,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: true, // assume verified since tied to appointment
    index: true
  },
  response: ResponseSchema,
  isReported: {
    type: Boolean,
    default: false,
    index: true
  },
  reportReasons: [{
    type: String,
    enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
  }],
  isHidden: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance and common queries
ReviewSchema.index({ stylistId: 1, isHidden: 1, createdAt: -1 });
ReviewSchema.index({ customerId: 1, createdAt: -1 });
ReviewSchema.index({ overallRating: -1, createdAt: -1 });
ReviewSchema.index({ helpfulCount: -1 });
ReviewSchema.index({ isVerified: 1, isHidden: 1 });

// Compound indexes for filtering
ReviewSchema.index({ 
  stylistId: 1, 
  overallRating: -1, 
  isHidden: 1, 
  createdAt: -1 
});

// Index for moderation
ReviewSchema.index({ 
  isReported: 1, 
  isHidden: 1, 
  createdAt: -1 
});

// Virtual for average category rating
ReviewSchema.virtual('averageCategoryRating').get(function() {
  const ratings = this.categoryRatings;
  const total = ratings.quality + ratings.timeliness + ratings.professionalism + 
                ratings.cleanliness + ratings.communication;
  return Math.round((total / 5) * 10) / 10; // round to 1 decimal
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);