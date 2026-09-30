import React from 'react';
import { Dumbbell, Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'form' | 'dashboard';
  hasSavedPlan: boolean;
  onNavigate: (view: 'landing' | 'form' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, hasSavedPlan, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Dumbbell className="w-5 h-5 transition-transform group-hover:rotate-12 duration-200" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            FitBuddy
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-slate-900 ${currentView === 'landing' ? 'text-slate-900 font-semibold' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('form')}
            className={`transition-colors hover:text-slate-900 ${currentView === 'form' ? 'text-slate-900 font-semibold' : ''}`}
          >
            Plan Generator
          </button>
          {hasSavedPlan && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors hover:text-slate-900 ${currentView === 'dashboard' ? 'text-slate-900 font-semibold' : ''}`}
            >
              My Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          {hasSavedPlan && currentView !== 'dashboard' && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
              <span>Saved Plan</span>
            </button>
          )}

          {currentView !== 'form' ? (
            <button
              onClick={() => onNavigate('form')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-sm shadow-emerald-600/20 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create My Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
