import mongoose, { Schema, Document } from 'mongoose';
import { ILesson } from '../types';

export interface ILessonDocument extends Omit<ILesson, '_id'>, Document {}

const lessonSchema = new Schema<ILessonDocument>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Video URL must be a valid URL'
    }
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail URL must be a valid URL'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  order: {
    type: Number,
    default: 0
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
lessonSchema.index({ category: 1, isPremium: 1 });
lessonSchema.index({ tags: 1 });
lessonSchema.index({ author: 1 });
lessonSchema.index({ createdAt: -1 });
lessonSchema.index({ order: 1 });

// Virtual for formatted duration
lessonSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Static method to get lessons by category
lessonSchema.statics.findByCategory = function(category: string, isPremium?: boolean) {
  const query: any = { category };
  if (isPremium !== undefined) {
    query.isPremium = isPremium;
  }
  return this.find(query).sort({ order: 1, createdAt: -1 });
};

// Static method to search lessons
lessonSchema.statics.search = function(searchTerm: string, isPremium?: boolean) {
  const query: any = {
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (isPremium !== undefined) {
    query.isPremium = isPremium;
  }
  
  return this.find(query).sort({ order: 1, createdAt: -1 });
};

export const Lesson = mongoose.model<ILessonDocument>('Lesson', lessonSchema);
