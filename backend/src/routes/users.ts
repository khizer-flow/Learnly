import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate, requireRole } from '../middleware/auth';
import {
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser
} from '../controllers/userController';

const router = Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

// User routes
router.put('/profile', authenticate, updateProfileValidation, validateRequest, updateProfile);

// Admin routes
router.get('/', authenticate, requireRole(['admin']), getAllUsers);
router.get('/:id', authenticate, requireRole(['admin']), getUserById);
router.delete('/:id', authenticate, requireRole(['admin']), deleteUser);

export default router;
