import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { CreditCard, Check, Zap, Crown, Building2, TrendingUp, Users, Bot } from 'lucide-react';

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
    icon: Zap,
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
    icon: Crown,
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
    icon: Building2,
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

// 3D Hover effect helper
const apply3DHover = (e: React.MouseEvent<HTMLElement>, intensity: number = 5) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (e.clientX - centerX) / (rect.width / 2);
  const deltaY = (e.clientY - centerY) / (rect.height / 2);
  
  e.currentTarget.style.transform = `perspective(1000px) rotateX(${deltaY * -intensity}deg) rotateY(${deltaX * intensity}deg) translateY(-4px) scale(1.02)`;
};

const reset3DHover = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
};

export const Billing: React.FC<BillingProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const planInfo = PLANS[currentPlan];

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <CreditCard size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-sm text-slate-400 font-mono">workspace.billing.management</p>
        </div>
      </div>

      {/* Current Subscription Card */}
      {subscription && (
        <div 
          className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 backdrop-blur-sm"
          style={{ 
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
          onMouseMove={(e) => apply3DHover(e, 3)}
          onMouseLeave={reset3DHover}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold mb-4">
                {planInfo.name}
              </span>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-bold text-white">
                  {planInfo.price > 0 ? `$${planInfo.price}` : 'Free'}
                </span>
                {planInfo.price > 0 && (
                  <span className="text-xl text-slate-400">/{planInfo.interval}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <span>Status:</span>
                <span className={`font-bold capitalize ${
                  subscription.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <p className="text-sm text-slate-500">
                  {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {hasPermission('billing:manage') && currentPlan !== 'free' && (
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={openBillingPortal}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all hover:scale-105"
                >
                  Manage Billing
                </button>
                {!subscription.cancelAtPeriodEnd && (
                  <button 
                    onClick={cancelSubscription}
                    className="px-5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20 transition-all"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-cyan-400" />
            Usage This Month
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Workflow Runs', icon: Zap, used: usage.runs.used, limit: planInfo.limits.runs },
              { label: 'Agents', icon: Bot, used: usage.agents.used, limit: planInfo.limits.agents },
              { label: 'Team Members', icon: Users, used: usage.seats.used, limit: planInfo.limits.seats },
            ].map((stat) => (
              <div 
                key={stat.label}
                className="p-5 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm group"
                style={{ 
                  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
                onMouseMove={(e) => apply3DHover(e)}
                onMouseLeave={reset3DHover}
              >
                <div className="flex items-center gap-3 mb-4">
                  <stat.icon size={18} className="text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">{stat.label}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stat.limit === -1 ? 0 : Math.min((stat.used / stat.limit) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="text-center text-slate-400 text-sm font-mono">
                  {stat.used} / {stat.limit === -1 ? '∞' : stat.limit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Available Plans</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = planKey === currentPlan;
            const PlanIcon = plan.icon;

            return (
              <div 
                key={planKey}
                className={`relative p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-cyan-500/10 border-cyan-500/40' 
                    : 'bg-[#080F1A]/60 border-cyan-500/15 hover:border-cyan-500/30'
                }`}
                style={{ 
                  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
                onMouseMove={(e) => apply3DHover(e)}
                onMouseLeave={reset3DHover}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-black text-xs font-bold">
                    Current Plan
                  </span>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <PlanIcon size={20} className="text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price > 0 ? `$${plan.price}` : 'Free'}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-slate-400 ml-1">/{plan.interval}</span>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {hasPermission('billing:manage') && !isCurrent && (
                  <button 
                    onClick={() => upgradePlan(planKey)}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all hover:scale-[1.02]"
                  >
                    {planKey === 'free' ? 'Downgrade' : currentPlan === 'free' ? 'Upgrade' : 'Change Plan'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
