import { Request, Response } from 'express';
import { Lesson } from '../models/Lesson';
import { AuthenticatedRequest } from '../types';

export const getAllLessons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const isPremium = req.query.isPremium as string;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isPremium !== undefined) {
      query.isPremium = isPremium === 'true';
    }

    // If user is not authenticated or doesn't have subscription, only show free lessons
    if (!req.user || !req.user.hasActiveSubscription()) {
      query.isPremium = false;
    }

    const total = await Lesson.countDocuments(query);
    const lessons = await Lesson.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Lessons retrieved successfully',
      data: {
        items: lessons,
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lessons',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getLessonById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
      return;
    }

    // Check if user can access premium content
    if (lesson.isPremium && (!req.user || !req.user.hasActiveSubscription())) {
      res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this lesson'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lesson retrieved successfully',
      data: lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lesson',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonData = req.body;

    const lesson = new Lesson(lessonData);
    await lesson.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndDelete(id);

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const searchLessons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const searchTerm = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const isPremium = req.query.isPremium as string;
    const skip = (page - 1) * limit;

    if (!searchTerm) {
      res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
      return;
    }

    // Build query
    const query: any = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };

    if (category) {
      query.category = category;
    }

    if (isPremium !== undefined) {
      query.isPremium = isPremium === 'true';
    }

    // If user is not authenticated or doesn't have subscription, only show free lessons
    if (!req.user || !req.user.hasActiveSubscription()) {
      query.isPremium = false;
    }

    const total = await Lesson.countDocuments(query);
    const lessons = await Lesson.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: {
        items: lessons,
        total,
        page,
        limit,
        totalPages,
        searchTerm
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search lessons',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getLessonsByCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isPremium = req.query.isPremium as string;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { category };

    if (isPremium !== undefined) {
      query.isPremium = isPremium === 'true';
    }

    // If user is not authenticated or doesn't have subscription, only show free lessons
    if (!req.user || !req.user.hasActiveSubscription()) {
      query.isPremium = false;
    }

    const total = await Lesson.countDocuments(query);
    const lessons = await Lesson.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Lessons retrieved successfully',
      data: {
        items: lessons,
        total,
        page,
        limit,
        totalPages,
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lessons by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
