import mongoose, { Schema, Document, Types } from 'mongoose';
import { ISubscription } from '../types';

export interface ISubscriptionDocument extends Omit<ISubscription, '_id' | 'userId'>, Document {
  userId: Types.ObjectId;
}

const subscriptionSchema = new Schema<ISubscriptionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: [true, 'Stripe customer ID is required'],
    unique: true
  },
  stripeSubscriptionId: {
    type: String,
    required: [true, 'Stripe subscription ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due'],
    default: 'inactive'
  },
  currentPeriodStart: {
    type: Date,
    required: [true, 'Current period start is required']
  },
  currentPeriodEnd: {
    type: Date,
    required: [true, 'Current period end is required']
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Virtual to check if subscription is active
subscriptionSchema.virtual('isActive').get(function(this: ISubscriptionDocument) {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
});

// Virtual to check if subscription is expiring soon (within 7 days)
subscriptionSchema.virtual('isExpiringSoon').get(function(this: ISubscriptionDocument) {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return this.status === 'active' && this.currentPeriodEnd <= sevenDaysFromNow;
});

// Static method to find active subscriptions
subscriptionSchema.statics.findActiveSubscriptions = function() {
  return this.find({
    status: 'active',
    currentPeriodEnd: { $gt: new Date() }
  }).populate('userId', 'email firstName lastName');
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiringSubscriptions = function(days = 7) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: { $lte: targetDate, $gt: new Date() }
  }).populate('userId', 'email firstName lastName');
};

// Method to update subscription status
subscriptionSchema.methods.updateStatus = function(newStatus: string) {
  this.status = newStatus;
  return this.save();
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function() {
  this.cancelAtPeriodEnd = true;
  return this.save();
};

export const Subscription = mongoose.model<ISubscriptionDocument>('Subscription', subscriptionSchema);
