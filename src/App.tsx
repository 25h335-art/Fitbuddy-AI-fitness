import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { ProfileForm } from './components/ProfileForm';
import { PlanDashboard } from './components/PlanDashboard';
import { LoadingView } from './components/LoadingView';
import { FitnessPlan, UserFitnessProfile } from './types/fitness';
import { PresetProfile } from './data/presets';
import { AlertCircle, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'fitbuddy_active_plan';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'form' | 'dashboard'>('landing');
  const [activePlan, setActivePlan] = useState<FitnessPlan | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserFitnessProfile | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore saved plan from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.fitnessSummary && parsed.weeklySchedule) {
          setActivePlan(parsed);
          setCurrentProfile(parsed.userProfile);
        }
      }
    } catch (e) {
      console.warn('Failed to restore saved plan from localStorage', e);
    }
  }, []);

  // Save active plan to localStorage
  const savePlan = (plan: FitnessPlan) => {
    setActivePlan(plan);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {
      console.warn('Failed to save plan to localStorage', e);
    }
  };

  const handleGeneratePlan = async (profile: UserFitnessProfile) => {
    setCurrentProfile(profile);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const generatedPlan: FitnessPlan = await response.json();
      savePlan(generatedPlan);
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error generating plan:', err);
      setErrorMessage(
        err?.message || 'We encountered an error generating your fitness plan. Please check your network and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: PresetProfile) => {
    setCurrentProfile(preset.profile);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartForm = () => {
    setErrorMessage(null);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModifyPlan = () => {
    if (activePlan?.userProfile) {
      setCurrentProfile(activePlan.userProfile);
    }
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewPlan = () => {
    setCurrentProfile(undefined);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        hasSavedPlan={!!activePlan}
        onNavigate={(view) => {
          setErrorMessage(null);
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Error notification banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 w-full">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-950">Generation Failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (currentProfile) handleGeneratePlan(currentProfile);
              }}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <LoadingView />
        ) : currentView === 'landing' ? (
          <LandingHero
            onStartForm={handleStartForm}
            onSelectPreset={handleSelectPreset}
            hasSavedPlan={!!activePlan}
            onViewSavedPlan={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentView === 'form' ? (
          <ProfileForm
            initialProfile={currentProfile}
            onSubmit={handleGeneratePlan}
            onCancel={() => {
              setCurrentView(activePlan ? 'dashboard' : 'landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isLoading={isLoading}
          />
        ) : activePlan ? (
          <PlanDashboard
            plan={activePlan}
            onModifyPlan={handleModifyPlan}
            onStartNewPlan={handleStartNewPlan}
          />
        ) : (
          <LandingHero
            onStartForm={handleStartForm}
            onSelectPreset={handleSelectPreset}
            hasSavedPlan={false}
            onViewSavedPlan={handleStartForm}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FitBuddy</span>
            <span aria-hidden="true">·</span>
            <span>Personalized AI Fitness & Nutrition Architecture</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Evidence-Based Guidance
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Heart className="w-3.5 h-3.5" />
              Consult Healthcare Providers
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
