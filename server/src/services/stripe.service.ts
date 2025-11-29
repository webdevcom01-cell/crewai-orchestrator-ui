import Stripe from 'stripe';
import { config } from '../config/index.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Plan configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: {
      maxAgents: 3,
      maxTasks: 10,
      maxRuns: 50,
      maxWorkspaces: 1,
      aiGenerations: 10,
      historyDays: 7,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: {
      maxAgents: 25,
      maxTasks: 100,
      maxRuns: 500,
      maxWorkspaces: 5,
      aiGenerations: 100,
      historyDays: 30,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 99,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
    features: {
      maxAgents: -1, // Unlimited
      maxTasks: -1,
      maxRuns: -1,
      maxWorkspaces: -1,
      aiGenerations: -1,
      historyDays: 90,
    },
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export interface CustomerData {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  id: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  planId: PlanId;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

class StripeService {
  // ============================================
  // Customer Management
  // ============================================

  /**
   * Create a new Stripe customer
   */
  async createCustomer(data: {
    email: string;
    name?: string;
    userId: string;
  }): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: {
        userId: data.userId,
      },
    });
  }

  /**
   * Get a Stripe customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        return null;
      }
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('[Stripe] Error fetching customer:', error);
      return null;
    }
  }

  /**
   * Update a Stripe customer
   */
  async updateCustomer(
    customerId: string,
    data: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    return await stripe.customers.update(customerId, data);
  }

  /**
   * Delete a Stripe customer
   */
  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      await stripe.customers.del(customerId);
      return true;
    } catch (error) {
      console.error('[Stripe] Error deleting customer:', error);
      return false;
    }
  }

  // ============================================
  // Subscription Management
  // ============================================

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(data: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    userId: string;
    workspaceId?: string;
  }): Promise<Stripe.Checkout.Session> {
    return await stripe.checkout.sessions.create({
      customer: data.customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        userId: data.userId,
        workspaceId: data.workspaceId || '',
      },
      subscription_data: {
        metadata: {
          userId: data.userId,
          workspaceId: data.workspaceId || '',
        },
      },
    });
  }

  /**
   * Create a billing portal session
   */
  async createPortalSession(data: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    return await stripe.billingPortal.sessions.create({
      customer: data.customerId,
      return_url: data.returnUrl,
    });
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('[Stripe] Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Get customer's active subscription
   */
  async getCustomerSubscription(customerId: string): Promise<Stripe.Subscription | null> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      return subscriptions.data[0] || null;
    } catch (error) {
      console.error('[Stripe] Error fetching customer subscription:', error);
      return null;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<Stripe.Subscription> {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Resume a cancelled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  // ============================================
  // Payment Methods
  // ============================================

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    return await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  /**
   * Detach a payment method
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.detach(paymentMethodId);
  }

  // ============================================
  // Invoices & Billing History
  // ============================================

  /**
   * Get customer's invoices
   */
  async getInvoices(
    customerId: string,
    limit: number = 10
  ): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  }

  /**
   * Get upcoming invoice
   */
  async getUpcomingInvoice(customerId: string): Promise<Stripe.UpcomingInvoice | null> {
    try {
      return await stripe.invoices.retrieveUpcoming({
        customer: customerId,
      });
    } catch (error) {
      // No upcoming invoice exists
      return null;
    }
  }

  // ============================================
  // Webhook Handling
  // ============================================

  /**
   * Construct webhook event from payload
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Get plan ID from price ID
   */
  getPlanFromPriceId(priceId: string): PlanId {
    for (const [planId, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (plan.priceId === priceId) {
        return planId as PlanId;
      }
    }
    return 'free';
  }

  /**
   * Get plan features
   */
  getPlanFeatures(planId: PlanId) {
    return SUBSCRIPTION_PLANS[planId]?.features || SUBSCRIPTION_PLANS.free.features;
  }

  // ============================================
  // Usage-based Billing (Optional)
  // ============================================

  /**
   * Report usage for metered billing
   */
  async reportUsage(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: number
  ): Promise<Stripe.UsageRecord> {
    return await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      action: 'increment',
    });
  }
}

export const stripeService = new StripeService();
export { stripe };
