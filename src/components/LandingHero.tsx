import React from 'react';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Dumbbell, Apple, Clock, Flame, ChevronRight } from 'lucide-react';
import { PRESET_PROFILES, PresetProfile } from '../data/presets';
import { UserFitnessProfile } from '../types/fitness';

interface LandingHeroProps {
  onStartForm: () => void;
  onSelectPreset: (preset: PresetProfile) => void;
  hasSavedPlan: boolean;
  onViewSavedPlan: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartForm,
  onSelectPreset,
  hasSavedPlan,
  onViewSavedPlan
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Natural kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI-Powered Exercise Science & Nutrition</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Your Body, Your Schedule,{' '}
                <span className="text-emerald-600">Your Perfect Fit.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                FitBuddy analyzes your metabolic rate, available equipment, fitness level, and dietary preferences using Gemini to engineer an individualized 7-day workout and meal blueprint.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onStartForm}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create My Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {hasSavedPlan && (
                  <button
                    onClick={onViewSavedPlan}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <span>View Saved Plan</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Proof bar */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>BMR & TDEE Calculations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Interactive 7-Day Split & Video Demos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Allergen-Safe Meal Guidance</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 group">
                <img
                  src="/src/assets/images/hero_fitness_training_1790748472627.jpg"
                  alt="Modern gym space with training weights in sunlight"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    // Fallback to stylized container if image asset fails
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.classList.add('bg-gradient-to-br', 'from-slate-900', 'to-slate-800');
                    }
                  }}
                />

                {/* Floating Preview Card on Hero */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/80 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Personalized Plan Preview</span>
                    <span className="font-mono text-emerald-600 font-semibold">Gemini 3.8 Flash</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">7-Day Split & Nutrition</h4>
                      <p className="text-xs text-slate-600">Sets, reps, rest intervals & daily recipes</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      7D
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Presets (1-Click Evaluation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
              Instant Presets
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Test with Ready-Made Profiles
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Click any profile below to pre-populate the generator instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRESET_PROFILES.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{preset.tag}</span>
                  <span className="font-medium text-slate-700">{preset.profile.gender}, {preset.profile.age}y</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {preset.label}
                </h3>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">Goal:</span>
                    <span>{preset.profile.fitnessGoal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">Diet:</span>
                    <span>{preset.profile.dietaryPreference}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">Equipment:</span>
                    <span className="truncate">{preset.profile.availableEquipment.join(', ')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectPreset(preset)}
                className="mt-5 w-full py-2 px-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Load Profile & Customize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Engineered For Real Results
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How FitBuddy Structures Your Plan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Biometric Calibrations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates your BMI, Basal Metabolic Rate (BMR), and Total Daily Energy Expenditure (TDEE) to deliver precision caloric guidance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">7-Day Split & Demos</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detailed exercises, sets, reps, and rest timers with biomechanical visual animations and direct video demonstration links.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Apple className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Allergen-Safe Nutrition</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured daily meals (Breakfast, Lunch, Dinner, Snack) respecting your dietary lifestyle with strict allergen exclusions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Safety & Rest Cycles</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored warm-up movements, cool-down stretches, and hydration protocols to safeguard joint health and optimize recovery.
            </p>
          </div>
        </div>
      </section>

      {/* Mandatory Medical Disclaimer Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Important Health Notice & Medical Disclaimer
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              This application provides general wellness and fitness guidance, not professional medical advice. Always consult a qualified healthcare professional before beginning any exercise or nutritional program, especially if you have pre-existing medical conditions, physical injuries, are pregnant, or have a history of eating disorders.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
