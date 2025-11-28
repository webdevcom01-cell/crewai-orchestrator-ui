import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface UsageStats {
  runs: { used: number; limit: number };
  agents: { used: number; limit: number };
  seats: { used: number; limit: number };
}

interface BillingProps {
  workspaceId: string;
}

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      '5 agents',
      '10 workflow runs/month',
      '1 team member',
      'Basic analytics',
      'Community support',
    ],
    limits: {
      agents: 5,
      runs: 10,
      seats: 1,
    },
  },
  pro: {
    name: 'Professional',
    price: 29,
    interval: 'month',
    features: [
      'Unlimited agents',
      '1,000 workflow runs/month',
      '5 team members',
      'Advanced analytics',
      'Priority support',
      'Version control',
      'Slack/Discord integration',
      'AI model switching',
    ],
    limits: {
      agents: -1,
      runs: 1000,
      seats: 5,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited agents',
      'Unlimited workflow runs',
      'Unlimited team members',
      'Advanced analytics',
      'Priority support',
      'Version control',
      'All integrations',
      'AI model switching',
      'Custom branding',
      'SSO/SAML',
      'SLA guarantee',
      'Dedicated account manager',
    ],
    limits: {
      agents: -1,
      runs: -1,
      seats: -1,
    },
  },
};

export const Billing: React.FC<BillingProps> = ({ workspaceId }) => {
  const { hasPermission, user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS | null>(null);

  useEffect(() => {
    loadBillingInfo();
  }, [workspaceId]);

  const loadBillingInfo = async () => {
    try {
      const [subRes, usageRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/subscription`),
        fetch(`/api/workspaces/${workspaceId}/usage`),
      ]);

      const subData = await subRes.json();
      const usageData = await usageRes.json();

      setSubscription(subData);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load billing info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradePlan = async (plan: keyof typeof PLANS) => {
    if (!hasPermission('billing:manage')) {
      alert('You do not have permission to manage billing');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/subscription/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        loadBillingInfo();
      }
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      alert('Failed to upgrade plan');
    }
  };

  const cancelSubscription = async () => {
    if (!hasPermission('billing:manage')) {
      alert('You do not have permission to manage billing');
      return;
    }

    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/subscription/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Subscription cancelled. You will retain access until the end of your billing period.');
        loadBillingInfo();
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const openBillingPortal = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/billing-portal`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading billing information...</div>;
  }

  const currentPlan = subscription?.plan || 'free';
  const planInfo = PLANS[currentPlan];

  return (
    <div className="billing">
      <h2>Billing & Subscription</h2>

      {subscription && (
        <div className="current-subscription">
          <div className="subscription-card">
            <div className="plan-badge">{planInfo.name}</div>
            <div className="plan-price">
              {planInfo.price > 0 ? (
                <>
                  <span className="price">${planInfo.price}</span>
                  <span className="interval">/{planInfo.interval}</span>
                </>
              ) : (
                <span className="price">Free</span>
              )}
            </div>
            <div className="subscription-status">
              Status: <span className={`status ${subscription.status}`}>{subscription.status}</span>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="renewal-date">
                {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}
            {hasPermission('billing:manage') && currentPlan !== 'free' && (
              <div className="subscription-actions">
                <button onClick={openBillingPortal} className="btn-portal">
                  Manage Billing
                </button>
                {!subscription.cancelAtPeriodEnd && (
                  <button onClick={cancelSubscription} className="btn-cancel-sub">
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {usage && (
        <div className="usage-section">
          <h3>Usage This Month</h3>
          <div className="usage-grid">
            <div className="usage-card">
              <h4>Workflow Runs</h4>
              <div className="usage-bar">
                <div
                  className="usage-fill"
                  style={{
                    width: `${planInfo.limits.runs === -1 ? 0 : (usage.runs.used / planInfo.limits.runs) * 100}%`,
                  }}
                />
              </div>
              <div className="usage-text">
                {usage.runs.used} / {planInfo.limits.runs === -1 ? '∞' : planInfo.limits.runs}
              </div>
            </div>

            <div className="usage-card">
              <h4>Agents</h4>
              <div className="usage-bar">
                <div
                  className="usage-fill"
                  style={{
                    width: `${planInfo.limits.agents === -1 ? 0 : (usage.agents.used / planInfo.limits.agents) * 100}%`,
                  }}
                />
              </div>
              <div className="usage-text">
                {usage.agents.used} / {planInfo.limits.agents === -1 ? '∞' : planInfo.limits.agents}
              </div>
            </div>

            <div className="usage-card">
              <h4>Team Members</h4>
              <div className="usage-bar">
                <div
                  className="usage-fill"
                  style={{
                    width: `${planInfo.limits.seats === -1 ? 0 : (usage.seats.used / planInfo.limits.seats) * 100}%`,
                  }}
                />
              </div>
              <div className="usage-text">
                {usage.seats.used} / {planInfo.limits.seats === -1 ? '∞' : planInfo.limits.seats}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="plans-section">
        <h3>Available Plans</h3>
        <div className="plans-grid">
          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = planKey === currentPlan;

            return (
              <div key={planKey} className={`plan-card ${isCurrent ? 'current' : ''}`}>
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  {isCurrent && <span className="current-badge">Current Plan</span>}
                </div>
                <div className="plan-price-section">
                  {plan.price > 0 ? (
                    <>
                      <span className="plan-price-large">${plan.price}</span>
                      <span className="plan-interval">/{plan.interval}</span>
                    </>
                  ) : (
                    <span className="plan-price-large">Free</span>
                  )}
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                {hasPermission('billing:manage') && !isCurrent && (
                  <button onClick={() => upgradePlan(planKey)} className="btn-upgrade">
                    {planKey === 'free' ? 'Downgrade' : currentPlan === 'free' ? 'Upgrade' : 'Change Plan'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .billing {
          padding: 20px;
          max-width: 1200px;
        }

        .current-subscription {
          margin-bottom: 40px;
        }

        .subscription-card {
          background: linear-gradient(135deg, rgba(0, 255, 159, 0.1), rgba(0, 212, 255, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 30px;
        }

        .plan-badge {
          display: inline-block;
          background: #00ff9f;
          color: #000;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .plan-price {
          font-size: 48px;
          font-weight: bold;
          color: white;
          margin-bottom: 15px;
        }

        .plan-price .interval {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.6);
        }

        .subscription-status {
          margin-bottom: 10px;
        }

        .status {
          font-weight: bold;
          text-transform: capitalize;
        }

        .status.active {
          color: #00ff9f;
        }

        .status.cancelled,
        .status.past_due {
          color: #ff4444;
        }

        .renewal-date {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
        }

        .subscription-actions {
          display: flex;
          gap: 10px;
        }

        .btn-portal {
          background: #00d4ff;
          color: #000;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-cancel-sub {
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
          padding: 10px 20px;
          border: 1px solid #ff4444;
          border-radius: 4px;
          cursor: pointer;
        }

        .usage-section {
          margin-bottom: 40px;
        }

        .usage-section h3 {
          margin-bottom: 20px;
        }

        .usage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .usage-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
        }

        .usage-card h4 {
          margin: 0 0 15px 0;
          font-size: 16px;
        }

        .usage-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .usage-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff9f, #00d4ff);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .usage-text {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .plans-section h3 {
          margin-bottom: 30px;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .plan-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 30px;
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          border-color: rgba(0, 255, 159, 0.5);
          transform: translateY(-4px);
        }

        .plan-card.current {
          border-color: #00ff9f;
          background: rgba(0, 255, 159, 0.05);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .plan-header h3 {
          margin: 0;
        }

        .current-badge {
          background: #00ff9f;
          color: #000;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .plan-price-section {
          margin-bottom: 30px;
        }

        .plan-price-large {
          font-size: 42px;
          font-weight: bold;
        }

        .plan-interval {
          color: rgba(255, 255, 255, 0.6);
          font-size: 18px;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 30px 0;
        }

        .plan-features li {
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .plan-features li:last-child {
          border-bottom: none;
        }

        .btn-upgrade {
          width: 100%;
          background: linear-gradient(135deg, #00ff9f, #00d4ff);
          color: #000;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
        }

        .btn-upgrade:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};
