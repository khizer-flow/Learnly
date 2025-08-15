import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionsAPI } from '../services/api';
import { 
  Crown, 
  Check, 
  X, 
  CreditCard, 
  Calendar,
  Star,
  Zap,
  Users,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const SubscriptionPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionsAPI.getStatus(),
    enabled: !!user,
  });

  const createCheckoutMutation = useMutation({
    mutationFn: subscriptionsAPI.createCheckoutSession,
    onSuccess: (data) => {
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      }
    },
    onError: (error) => {
      toast.error('Failed to create checkout session');
    },
  });

  const createBillingPortalMutation = useMutation({
    mutationFn: subscriptionsAPI.createBillingPortalSession,
    onSuccess: (data) => {
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      }
    },
    onError: (error) => {
      toast.error('Failed to open billing portal');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: subscriptionsAPI.cancel,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Subscription cancelled successfully');
        queryClient.invalidateQueries(['subscription-status']);
        // Update user subscription status
        if (user) {
          updateUser({
            ...user,
            subscription: {
              ...user.subscription,
              status: 'cancelled',
            },
          });
        }
      }
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription');
    },
  });

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true);
    try {
      await createCheckoutMutation.mutateAsync({
        priceId,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      await createBillingPortalMutation.mutateAsync({
        returnUrl: `${window.location.origin}/subscription`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium content at the end of your current billing period.')) {
      await cancelSubscriptionMutation.mutateAsync();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const plans = [
    {
      id: 'price_monthly',
      name: 'Monthly',
      price: '$19.99',
      period: 'month',
      features: [
        'Access to all premium lessons',
        'HD video quality',
        'Download lessons for offline viewing',
        'Priority customer support',
        'Certificate of completion',
        'Access to exclusive content'
      ],
      popular: false
    },
    {
      id: 'price_yearly',
      name: 'Yearly',
      price: '$199.99',
      period: 'year',
      features: [
        'Everything in Monthly plan',
        '2 months free (save $40)',
        'Early access to new content',
        'Exclusive member-only events',
        'Personal learning path',
        'Advanced progress tracking'
      ],
      popular: true
    }
  ];

  const subscription = subscriptionData?.data?.subscription;
  const hasActiveSubscription = subscriptionData?.data?.hasSubscription;

  if (isLoadingSubscription) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock unlimited access to premium content and accelerate your learning journey
        </p>
      </div>

      {/* Current Subscription Status */}
      {hasActiveSubscription && subscription && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Current Subscription
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                  Premium Plan
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Next billing: {formatDate(subscription.currentPeriodEnd)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status === 'active' ? 'Active' : 'Cancelled'}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleManageBilling}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 mr-2 inline" />
                Manage Billing
              </button>
              {subscription.status === 'active' && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-sm border-2 p-8 ${
              plan.popular 
                ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' 
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              {plan.popular && (
                <p className="text-sm text-green-600 font-medium">
                  Save $40 compared to monthly
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={isLoading || hasActiveSubscription}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : hasActiveSubscription ? (
                'Current Plan'
              ) : (
                <div className="flex items-center justify-center">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          What's Included
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Premium Content
            </h3>
            <p className="text-gray-600">
              Access to all premium lessons, exclusive content, and advanced courses
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enhanced Features
            </h3>
            <p className="text-gray-600">
              HD video quality, offline downloads, and advanced progress tracking
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Community Access
            </h3>
            <p className="text-gray-600">
              Join exclusive member events and connect with fellow learners
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600">
              We offer a 7-day free trial for new subscribers. You can cancel anytime during the trial period.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change my plan?
            </h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at your next billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
