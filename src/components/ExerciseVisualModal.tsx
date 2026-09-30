import React, { useState } from 'react';
import { X, Play, AlertTriangle, CheckCircle2, Clock, Dumbbell, Film, Sparkles, User, ExternalLink } from 'lucide-react';
import { Exercise } from '../types/fitness';
import { AnimatedHumanTrainer } from './AnimatedHumanTrainer';

interface ExerciseVisualModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onStartRestTimer?: (seconds: number, exerciseName: string) => void;
}

// Curated verified YouTube video tutorial IDs for high-fidelity in-app playback with zero external navigation
const EXERCISE_YOUTUBE_MAP: Record<string, { id: string; title: string }> = {
  // Squat Variations
  'goblet squat': { id: 'MeIiIdhvXT4', title: 'How To Goblet Squat with Proper Form' },
  'air squat': { id: 'C_VtOYc6j5c', title: 'Bodyweight Air Squat Technique' },
  'squat': { id: 'bEv6CCg2BC8', title: 'How to Squat Properly (Step by Step)' },
  'leg press': { id: 'IZxyjW7MPJQ', title: 'Leg Press Proper Form' },
  
  // Push & Chest Variations
  'push-up': { id: 'IODxDxX7oi4', title: 'Perfect Push Up Form Tutorial' },
  'pushup': { id: 'IODxDxX7oi4', title: 'Perfect Push Up Form Tutorial' },
  'floor press': { id: 'uUGDRwge4F8', title: 'Dumbbell Floor Press Technique' },
  'bench press': { id: 'rT7DgCr-3pg', title: 'How To Bench Press Properly' },
  'chest press': { id: 'VmB1G1K7v94', title: 'Dumbbell Chest Press Technique' },
  'dip': { id: '2z8JmcrW-As', title: 'How To Do Dips with Proper Form' },

  // Shoulders
  'shoulder press': { id: 'qEwKCR5JCog', title: 'Seated Dumbbell Shoulder Press' },
  'overhead press': { id: '2yjwXTZQDDI', title: 'Overhead Press Guide' },
  'pike push': { id: 'sposDXWEB0A', title: 'Pike Pushup Form' },
  'lateral raise': { id: '3VcKaXpzqRo', title: 'Dumbbell Lateral Raise Form' },

  // Pulls & Back
  'row': { id: '6TSP13B51bQ', title: 'How To Dumbbell Bent-Over Row' },
  'lat pulldown': { id: 'CAwf7n6Luuc', title: 'Lat Pulldown Proper Form' },
  'pull-up': { id: 'eGo4IYlbE5g', title: 'How to Do a Pull Up' },
  'cobra': { id: 'c90NfB9eE64', title: 'Prone Cobra Exercise' },
  'inverted row': { id: 'hXTc1mDnZCw', title: 'Inverted Row Tutorial' },

  // Hinges & Deadlifts
  'deadlift': { id: 'op9kVnSso6Q', title: 'Romanian Deadlift (RDL) Form' },
  'rdl': { id: 'op9kVnSso6Q', title: 'Romanian Deadlift (RDL) Form' },
  'hinge': { id: 'JCXUYuzwNrM', title: 'Hip Hinge Movement Pattern' },

  // Lunges
  'lunge': { id: 'QOVaHwm-Q6U', title: 'How To Do Lunges with Perfect Form' },
  'split squat': { id: '2C-uNgKwPLE', title: 'Bulgarian Split Squat Form' },
  'step-up': { id: 'dQqApCGoi54', title: 'Dumbbell Step-Up Form' },

  // Core
  'plank': { id: 'ASdvN_XEl_c', title: 'How to Plank with Perfect Form' },
  'dead bug': { id: 'g_BYB0R-4Ws', title: 'Dead Bug Exercise Tutorial' },
  'hollow body': { id: 'LlDNf79s4gA', title: 'Hollow Body Hold Form' },
  'crunch': { id: 'Xyd_fa5zoEU', title: 'Abdominal Crunch Proper Technique' },

  // Arms
  'curl': { id: 'ykJmrZ5v0Oo', title: 'How To Dumbbell Bicep Curl' },
  'tricep': { id: 'nRiJVZDpdL0', title: 'Triceps Extension Form' }
};

function getYouTubeEmbedForExercise(name: string): { id: string; title: string } {
  const nameLower = name.toLowerCase();
  for (const [key, val] of Object.entries(EXERCISE_YOUTUBE_MAP)) {
    if (nameLower.includes(key)) {
      return val;
    }
  }
  // Default to comprehensive compound form tutorial
  return { id: 'bEv6CCg2BC8', title: `${name} Proper Technique Tutorial` };
}

export const ExerciseVisualModal: React.FC<ExerciseVisualModalProps> = ({
  exercise,
  onClose,
  onStartRestTimer
}) => {
  const [viewMode, setViewMode] = useState<'animated' | 'video'>('animated');

  if (!exercise) return null;

  const ytVideo = getYouTubeEmbedForExercise(exercise.name);
  // Privacy-enhanced embed URL that plays right inside the modal with no surfing
  const embedUrl = `https://www.youtube-nocookie.com/embed/${ytVideo.id}?rel=0&modestbranding=1&enablejsapi=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {exercise.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target: {exercise.targetedMuscles} · Intensity: {exercise.intensity}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Segmented Switcher: Animated Human vs Embedded In-App Video */}
        <div className="px-5 pt-3 pb-1 bg-slate-50 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setViewMode('animated')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'animated'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Animated Human Coach</span>
            </button>
            <button
              onClick={() => setViewMode('video')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'video'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-rose-600" />
              <span>In-App YouTube Video</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {viewMode === 'animated' ? 'Kinetic Human Form' : 'Watch Here · Zero Surfing'}
          </span>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Visual Display (Animated Human or In-App Video) */}
          <div>
            {viewMode === 'animated' ? (
              <AnimatedHumanTrainer
                exerciseName={exercise.name}
                targetedMuscles={exercise.targetedMuscles}
                intensity={exercise.intensity}
              />
            ) : (
              /* Embedded YouTube Player directly inside modal (No user surfing!) */
              <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950">
                <div className="aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    title={ytVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                <div className="p-3 bg-slate-900 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-semibold text-slate-200 truncate max-w-[280px]">
                      {ytVideo.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Plays inside FitBuddy
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
            <div>
              <span className="text-[11px] text-slate-500 block">Sets × Reps</span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                {exercise.sets} × {exercise.reps}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Rest Period</span>
              <span className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                {exercise.restSeconds}s
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Intensity</span>
              <span className="text-sm font-bold text-slate-900">
                {exercise.intensity}
              </span>
            </div>
          </div>

          {/* Step-by-Step Execution Guide */}
          {exercise.stepByStepGuide && exercise.stepByStepGuide.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Step-by-Step Execution Guide
              </h4>
              <ol className="space-y-2.5">
                {exercise.stepByStepGuide.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Form Cues & Coaching Notes */}
          {exercise.formCues && (
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-950">
              <span className="font-semibold block mb-1 text-blue-900">Coaching Form Cue:</span>
              <p className="leading-relaxed text-blue-800">{exercise.formCues}</p>
            </div>
          )}

          {/* Common Mistakes to Avoid */}
          {exercise.mistakesToAvoid && exercise.mistakesToAvoid.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Common Mistakes to Avoid
              </h4>
              <ul className="space-y-2">
                {exercise.mistakesToAvoid.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {onStartRestTimer && (
            <button
              onClick={() => {
                onStartRestTimer(exercise.restSeconds || 60, exercise.name);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Launch {exercise.restSeconds}s Rest Timer</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
