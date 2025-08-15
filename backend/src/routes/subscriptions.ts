import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  createCheckoutSession,
  createBillingPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook
} from '../controllers/subscriptionController';

const router = Router();

// Validation rules
const checkoutSessionValidation = [
  body('priceId')
    .notEmpty()
    .withMessage('Price ID is required'),
  body('successUrl')
    .isURL()
    .withMessage('Success URL must be a valid URL'),
  body('cancelUrl')
    .isURL()
    .withMessage('Cancel URL must be a valid URL')
];

const billingPortalValidation = [
  body('returnUrl')
    .isURL()
    .withMessage('Return URL must be a valid URL')
];

// Routes
router.post('/create-checkout-session', authenticate, checkoutSessionValidation, validateRequest, createCheckoutSession);
router.post('/create-billing-portal-session', authenticate, billingPortalValidation, validateRequest, createBillingPortalSession);
router.get('/status', authenticate, getSubscriptionStatus);
router.post('/cancel', authenticate, cancelSubscription);
router.post('/webhook', handleWebhook); // No authentication for webhook

export default router;
