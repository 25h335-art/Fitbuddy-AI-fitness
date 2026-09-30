import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Dumbbell, Apple, ShieldCheck, Heart } from 'lucide-react';

const LOADING_STEPS = [
  { label: 'Calibrating Basal Metabolic Rate (BMR) & TDEE...', icon: Activity },
  { label: 'Formulating optimal 7-day progressive workout split...', icon: Dumbbell },
  { label: 'Generating sets, reps, rest intervals & visual form cues...', icon: Sparkles },
  { label: 'Structuring allergen-free macro-balanced daily nutrition...', icon: Apple },
  { label: 'Compiling safety guidelines & mobility protocols...', icon: ShieldCheck }
];

const FITNESS_FACTS = [
  'Did you know? Consistent progressive overload is the primary physiological driver of hypertrophy and muscular strength.',
  'Hydration tip: Drinking 500ml of water 30 minutes before exercise optimizes cellular hydration and work capacity.',
  'Protein synthesis: Spreading protein across 3-4 meals maximizes muscle protein synthesis (MPS) throughout the day.',
  'Active recovery: Low-intensity walks on rest days promote blood flow, clearing metabolic byproducts without straining joints.',
  'Sleep is key: Deep stage 3 slow-wave sleep is when your body releases up to 70% of its daily human growth hormone.'
];

export const LoadingView: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);

    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % FITNESS_FACTS.length);
    }, 4500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(factInterval);
    };
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central animated orb */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Generating Your FitBuddy Plan
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Gemini is synthesizing exercise physiology and clinical nutrition algorithms.
        </p>

        {/* Progression Steps */}
        <div className="space-y-3 text-left mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          {LOADING_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                  isCurrent ? 'text-emerald-800 font-semibold' : isDone ? 'text-slate-500' : 'text-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-100 text-emerald-700 animate-pulse border border-emerald-400'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Rotating fitness science fact */}
        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            <span>FitBuddy Science Insight</span>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed transition-all duration-300">
            {FITNESS_FACTS[currentFactIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};
