import { Request, Response } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { StripeService } from '../services/stripeService';
import { AuthenticatedRequest } from '../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const user = req.user!;

    // Check if user already has a Stripe customer ID
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await StripeService.createCustomer(user);
      customerId = customer.id;

      // Update user with Stripe customer ID
      const userDoc = await User.findById(user._id);
      if (!userDoc) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      userDoc.subscription = {
        status: userDoc.subscription?.status || 'inactive',
        stripeCustomerId: customerId,
        stripeSubscriptionId: userDoc.subscription?.stripeSubscriptionId,
        currentPeriodEnd: userDoc.subscription?.currentPeriodEnd
      };
      await userDoc.save();
    }

    // Create checkout session
    const session = await StripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.status(200).json({
      success: true,
      message: 'Checkout session created successfully',
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createBillingPortalSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { returnUrl } = req.body;
    const user = req.user!;

    if (!user.subscription?.stripeCustomerId) {
      res.status(400).json({
        success: false,
        message: 'No subscription found for this user'
      });
      return;
    }

    // Create billing portal session
    const session = await StripeService.createBillingPortalSession(
      user.subscription.stripeCustomerId,
      returnUrl
    );

    res.status(200).json({
      success: true,
      message: 'Billing portal session created successfully',
      data: {
        url: session.url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create billing portal session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSubscriptionStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    if (!user.subscription?.stripeSubscriptionId) {
      res.status(200).json({
        success: true,
        message: 'No subscription found',
        data: {
          hasSubscription: false,
          subscription: null
        }
      });
      return;
    }

    // Get subscription details from Stripe
    const stripeSubscription = await StripeService.getSubscription(user.subscription.stripeSubscriptionId);

    // Get local subscription record
    const localSubscription = await Subscription.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Subscription status retrieved successfully',
      data: {
        hasSubscription: true,
        subscription: {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          localStatus: localSubscription?.status,
          isActive: user.hasActiveSubscription()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cancelSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    if (!user.subscription?.stripeSubscriptionId) {
      res.status(400).json({
        success: false,
        message: 'No subscription found for this user'
      });
      return;
    }

    // Cancel subscription in Stripe
    const subscription = await StripeService.cancelSubscription(user.subscription.stripeSubscriptionId);

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({
      success: false,
      message: 'Webhook signature verification failed'
    });
    return;
  }

  try {
    // Handle the webhook event
    await StripeService.handleWebhookEvent(event);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};
