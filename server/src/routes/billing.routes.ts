import { Router, Response, NextFunction } from 'express';
import { stripeService, SUBSCRIPTION_PLANS, PlanId } from '../services/stripe.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ============================================
// Get Available Plans
// ============================================

router.get('/plans', (_req: Request, res: Response) => {
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
    id,
    name: plan.name,
    price: plan.price,
    features: plan.features,
  }));

  res.json({
    success: true,
    data: plans,
  });
});

// ============================================
// Get Current Subscription
// ============================================

router.get('/subscription', authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      res.json({
        success: true,
        data: {
          plan: 'free',
          subscription: null,
          features: SUBSCRIPTION_PLANS.free.features,
        },
      });
    }

    const subscription = await stripeService.getCustomerSubscription(user.stripeCustomerId);

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          plan: 'free',
          subscription: null,
          features: SUBSCRIPTION_PLANS.free.features,
        },
      });
    }

    const priceId = subscription.items.data[0]?.price.id;
    const planId = stripeService.getPlanFromPriceId(priceId);

    res.json({
      success: true,
      data: {
        plan: planId,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        features: stripeService.getPlanFeatures(planId),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Create Checkout Session
// ============================================

router.post('/checkout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { planId, workspaceId } = req.body;

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[planId as PlanId];
    if (!plan || !plan.priceId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected',
      });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer({
        email: user.email,
        name: user.name,
        userId: user.id,
      });
      customerId = customer.id;
      
      // TODO: Update user with stripeCustomerId in database
      // await userRepository.update(user.id, { stripeCustomerId: customerId });
    }

    // Get base URL from environment or request
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId: plan.priceId,
      successUrl: `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/billing?canceled=true`,
      userId: user.id,
      workspaceId,
    });

    res.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Create Billing Portal Session
// ============================================

router.post('/portal', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No billing account found',
      });
    }

    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

    const session = await stripeService.createPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: `${baseUrl}/billing`,
    });

    res.json({
      success: true,
      data: {
        portalUrl: session.url,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Cancel Subscription
// ============================================

router.post('/cancel', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { immediately = false } = req.body;

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No billing account found',
      });
    }

    const subscription = await stripeService.getCustomerSubscription(user.stripeCustomerId);
    if (!subscription) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    const canceledSubscription = await stripeService.cancelSubscription(
      subscription.id,
      immediately
    );

    res.json({
      success: true,
      data: {
        message: immediately
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at the end of the billing period',
        subscription: {
          id: canceledSubscription.id,
          status: canceledSubscription.status,
          cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Resume Subscription
// ============================================

router.post('/resume', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No billing account found',
      });
    }

    const subscription = await stripeService.getCustomerSubscription(user.stripeCustomerId);
    if (!subscription) {
      return res.status(400).json({
        success: false,
        error: 'No subscription found',
      });
    }

    const resumedSubscription = await stripeService.resumeSubscription(subscription.id);

    res.json({
      success: true,
      data: {
        message: 'Subscription resumed',
        subscription: {
          id: resumedSubscription.id,
          status: resumedSubscription.status,
          cancelAtPeriodEnd: resumedSubscription.cancel_at_period_end,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Get Invoices
// ============================================

router.get('/invoices', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const invoices = await stripeService.getInvoices(user.stripeCustomerId);

    res.json({
      success: true,
      data: invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: invoice.status,
        date: invoice.created ? new Date(invoice.created * 1000) : null,
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Get Payment Methods
// ============================================

router.get('/payment-methods', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const paymentMethods = await stripeService.getPaymentMethods(user.stripeCustomerId);

    res.json({
      success: true,
      data: paymentMethods.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Stripe Webhook Handler
// ============================================

router.post(
  '/webhook',
  // Use raw body for webhook signature verification
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Stripe Webhook] Missing webhook secret');
      return res.status(500).send('Webhook secret not configured');
    }

    let event: ReturnType<typeof stripeService.constructWebhookEvent>;

    try {
      event = stripeService.constructWebhookEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[Stripe] Checkout completed:', session.id);
        // TODO: Update user subscription in database
        // const userId = session.metadata?.userId;
        // const subscriptionId = session.subscription;
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log('[Stripe] Subscription created:', subscription.id);
        // TODO: Update user subscription status
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('[Stripe] Subscription updated:', subscription.id);
        // TODO: Update user subscription status/plan
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('[Stripe] Subscription deleted:', subscription.id);
        // TODO: Downgrade user to free plan
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('[Stripe] Invoice paid:', invoice.id);
        // TODO: Record payment in database
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('[Stripe] Invoice payment failed:', invoice.id);
        // TODO: Notify user, handle failed payment
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
