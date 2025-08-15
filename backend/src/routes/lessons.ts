import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate, requireRole, requireSubscription, optionalAuth } from '../middleware/auth';
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  searchLessons,
  getLessonsByCategory
} from '../controllers/lessonController';

const router = Router();

// Validation rules
const lessonValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('duration')
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  body('tags')
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('isPremium')
    .isBoolean()
    .withMessage('isPremium must be a boolean'),
  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),
  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('Thumbnail URL must be a valid URL')
];

const updateLessonValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('isPremium')
    .optional()
    .isBoolean()
    .withMessage('isPremium must be a boolean'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),
  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('Thumbnail URL must be a valid URL')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Category cannot be empty'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),
  query('isPremium')
    .optional()
    .isBoolean()
    .withMessage('isPremium must be a boolean')
];

// Public routes (with optional auth for premium content filtering)
router.get('/', queryValidation, validateRequest, optionalAuth, getAllLessons);
router.get('/search', queryValidation, validateRequest, optionalAuth, searchLessons);
router.get('/category/:category', queryValidation, validateRequest, optionalAuth, getLessonsByCategory);
router.get('/:id', optionalAuth, getLessonById);

// Protected routes (require authentication and subscription for premium content)
router.get('/premium/:id', authenticate, requireSubscription, getLessonById);

// Admin routes (require admin role)
router.post('/', authenticate, requireRole(['admin']), lessonValidation, validateRequest, createLesson);
router.put('/:id', authenticate, requireRole(['admin']), updateLessonValidation, validateRequest, updateLesson);
router.delete('/:id', authenticate, requireRole(['admin']), deleteLesson);

export default router;
