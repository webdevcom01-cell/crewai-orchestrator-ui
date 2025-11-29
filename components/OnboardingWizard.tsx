import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Users, ListTodo, Workflow, Rocket } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const STORAGE_KEY = 'crewai-onboarding-completed';

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CrewAI Orchestrator! 🚀',
      description: 'Let\'s get you started with building powerful AI agent workflows.',
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            CrewAI Orchestrator helps you create, manage, and run teams of AI agents 
            that work together to accomplish complex tasks.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-white/5 border border-[var(--border-default)]">
              <span className="text-2xl">🤖</span>
              <h4 className="font-semibold mt-2">AI Agents</h4>
              <p className="text-sm text-[var(--text-muted)]">Create specialized agents</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[var(--border-default)]">
              <span className="text-2xl">📋</span>
              <h4 className="font-semibold mt-2">Tasks</h4>
              <p className="text-sm text-[var(--text-muted)]">Define work to be done</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[var(--border-default)]">
              <span className="text-2xl">👥</span>
              <h4 className="font-semibold mt-2">Crews</h4>
              <p className="text-sm text-[var(--text-muted)]">Combine agents & tasks</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[var(--border-default)]">
              <span className="text-2xl">▶️</span>
              <h4 className="font-semibold mt-2">Runs</h4>
              <p className="text-sm text-[var(--text-muted)]">Execute & monitor</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'agents',
      title: 'Step 1: Create Your Agents',
      description: 'Agents are AI workers with specific roles, goals, and expertise.',
      icon: <Users className="w-8 h-8 text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Each agent has a unique role and backstory that guides how they approach tasks.
            You can create agents like:
          </p>
          <ul className="space-y-2 mt-4">
            <li className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                📊
              </span>
              <div>
                <span className="font-medium">Research Analyst</span>
                <p className="text-xs text-[var(--text-muted)]">Gathers and analyzes information</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                ✍️
              </span>
              <div>
                <span className="font-medium">Content Writer</span>
                <p className="text-xs text-[var(--text-muted)]">Creates written content</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <span className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                🎯
              </span>
              <div>
                <span className="font-medium">Project Manager</span>
                <p className="text-xs text-[var(--text-muted)]">Coordinates team efforts</p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'tasks',
      title: 'Step 2: Define Tasks',
      description: 'Tasks are specific pieces of work that agents will complete.',
      icon: <ListTodo className="w-8 h-8 text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Break down your goals into clear, actionable tasks. Each task can be 
            assigned to a specific agent and includes:
          </p>
          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-6 h-6 rounded-full bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)] text-sm">
                1
              </div>
              <div>
                <span className="font-medium">Description</span>
                <p className="text-xs text-[var(--text-muted)]">What needs to be accomplished</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-6 h-6 rounded-full bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)] text-sm">
                2
              </div>
              <div>
                <span className="font-medium">Expected Output</span>
                <p className="text-xs text-[var(--text-muted)]">The deliverable or result</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-6 h-6 rounded-full bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)] text-sm">
                3
              </div>
              <div>
                <span className="font-medium">Assigned Agent</span>
                <p className="text-xs text-[var(--text-muted)]">Who will complete the task</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'crews',
      title: 'Step 3: Build Crews',
      description: 'Crews combine agents and tasks into a coordinated workflow.',
      icon: <Workflow className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            A crew is where everything comes together. Choose your process type:
          </p>
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-white/5 border border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <span className="font-semibold">Sequential</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Tasks are executed one after another in order. 
                Each task can use the output of previous tasks.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span className="font-semibold">Hierarchical</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                A manager agent coordinates other agents, 
                delegating and reviewing work dynamically.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'run',
      title: 'Step 4: Run & Monitor',
      description: 'Execute your crew and watch the magic happen!',
      icon: <Rocket className="w-8 h-8 text-orange-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            When you run a crew, you'll see real-time updates as your agents 
            work through each task. Monitor progress, view outputs, and 
            iterate on your workflow.
          </p>
          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 
                        border border-[var(--border-default)] mt-6">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Pro Tip
            </h4>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Start simple! Create one agent, one task, and run a basic crew 
              to see how everything works. Then iterate and add complexity.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6 p-4 rounded-lg bg-green-500/10">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">You're ready to start building!</span>
          </div>
        </div>
      ),
    },
  ];

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep(s => s + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrev = () => {
    setCurrentStep(s => Math.max(0, s - 1));
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    setTimeout(() => onSkip?.() || onComplete(), 300);
  };

  // Check if already completed
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]" />

      {/* Modal */}
      <div className={`fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 
                      md:-translate-x-1/2 md:-translate-y-1/2
                      md:w-full md:max-w-lg z-[201]
                      bg-[var(--bg-surface)] border border-[var(--border-default)]
                      rounded-2xl shadow-2xl overflow-hidden
                      transition-all duration-300
                      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300
                          ${i <= currentStep 
                            ? 'w-6 bg-[var(--accent-cyan)]' 
                            : 'w-1.5 bg-white/20'
                          }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleSkip}
            className="p-1 rounded hover:bg-white/10 transition-colors text-[var(--text-muted)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center">
              {step.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {step.title}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {step.description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="mt-6 max-h-[40vh] overflow-y-auto">
            {step.content}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border-default)]">
          <button
            onClick={handleSkip}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Skip tutorial
          </button>

          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2 rounded-lg
                          text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-6 py-2 rounded-lg
                        bg-[var(--accent-cyan)] text-black font-medium
                        hover:brightness-110 transition-all"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to check if onboarding is needed
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    setShowOnboarding,
    resetOnboarding,
  };
}

export default OnboardingWizard;
