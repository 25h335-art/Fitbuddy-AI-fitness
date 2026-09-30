import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Scale, 
  Activity, 
  Apple, 
  Droplets, 
  ShieldCheck, 
  Play, 
  Clock, 
  Printer, 
  RotateCcw, 
  Share2, 
  Check, 
  ExternalLink, 
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  Award,
  Download
} from 'lucide-react';
import { FitnessPlan, DayWorkout, Exercise, MealSuggestion } from '../types/fitness';
import { ExerciseVisualModal } from './ExerciseVisualModal';
import { RestTimerModal } from './RestTimerModal';
import { downloadFitnessPlanPDF } from '../utils/pdfGenerator';

interface PlanDashboardProps {
  plan: FitnessPlan;
  onModifyPlan: () => void;
  onStartNewPlan: () => void;
}

export const PlanDashboard: React.FC<PlanDashboardProps> = ({
  plan,
  onModifyPlan,
  onStartNewPlan
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'workouts' | 'nutrition' | 'safety'>('workouts');
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [restTimerState, setRestTimerState] = useState<{ active: boolean; seconds: number; exerciseName?: string }>({
    active: false,
    seconds: 60
  });

  // Track completed exercises per day in local state
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState(false);

  const toggleExerciseComplete = (dayNum: number, exerciseIndex: number) => {
    const key = `d${dayNum}-e${exerciseIndex}`;
    setCompletedExercises((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleStartRestTimer = (seconds: number, exerciseName?: string) => {
    setRestTimerState({
      active: true,
      seconds: seconds || 60,
      exerciseName
    });
  };

  const handleShare = async () => {
    const textToShare = `FitBuddy Plan for ${plan.userProfile.fitnessGoal}
Daily Calories: ${plan.calorieTarget} kcal | Protein: ${plan.proteinTargetGrams}g | BMI: ${plan.bmi} (${plan.bmiCategory})
7-Day Workout Split: ${plan.weeklySchedule.map(d => `${d.dayName}: ${d.focusTitle}`).join(', ')}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textToShare);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      // Generate client-side PDF document
      downloadFitnessPlanPDF(plan);
      setPdfSuccessToast(true);
      setTimeout(() => setPdfSuccessToast(false), 3500);
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback to window.print() if client PDF generation fails
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Find currently selected day
  const currentDay = plan.weeklySchedule.find((d) => d.dayNumber === selectedDayNumber) || plan.weeklySchedule[0];

  // Calculate day completion progress
  const totalDayExercises = currentDay?.exercises?.length || 0;
  const completedCount = currentDay?.exercises?.filter((_, idx) => completedExercises[`d${selectedDayNumber}-e${idx}`]).length || 0;
  const dayProgressPct = totalDayExercises > 0 ? Math.round((completedCount / totalDayExercises) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Generated for {plan.userProfile.gender}, {plan.userProfile.age}y</span>
            <span aria-hidden="true">·</span>
            <span>Goal: {plan.userProfile.fitnessGoal}</span>
            <span aria-hidden="true">·</span>
            <span>Level: {plan.userProfile.workoutExperience}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Personalized Fitness Blueprint
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direct Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300/80 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Download full 7-day fitness plan as PDF file"
          >
            {pdfSuccessToast ? (
              <Check className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <Download className={`w-3.5 h-3.5 text-emerald-700 ${downloadingPdf ? 'animate-bounce' : ''}`} />
            )}
            <span>
              {downloadingPdf
                ? 'Building PDF...'
                : pdfSuccessToast
                ? 'PDF Downloaded!'
                : 'Download PDF'}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedToast ? 'Summary Copied!' : 'Share Plan'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Print layout directly"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Layout</span>
          </button>

          <button
            onClick={onModifyPlan}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Adjust Inputs</span>
          </button>

          <button
            onClick={onStartNewPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-950 mb-0.5">Medical Notice & Professional Guidance:</span>
          <span>{plan.medicalDisclaimer}</span>
        </div>
      </div>

      {/* Key Biometrics & Metabolic Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. BMI Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-600">Body Mass Index</span>
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
                {plan.bmi}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {plan.bmiCategory}
              </span>
            </div>
            {/* Visual BMI Scale Indicator */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex my-2">
              <div className="h-full bg-sky-300 w-1/4" title="Underweight (<18.5)" />
              <div className="h-full bg-emerald-400 w-1/4" title="Normal (18.5-24.9)" />
              <div className="h-full bg-amber-400 w-1/4" title="Overweight (25-29.9)" />
              <div className="h-full bg-rose-400 w-1/4" title="Obesity (>=30)" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 leading-relaxed">
            {plan.bmiAdvice}
          </p>
        </div>

        {/* 2. Calorie Target Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-600">Daily Calorie Target</span>
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
                {plan.calorieTarget}
              </span>
              <span className="text-xs font-semibold text-slate-500">kcal/day</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono my-2">
              <span>BMR: {plan.bmrEstimate} kcal</span>
              <span aria-hidden="true">·</span>
              <span>TDEE: {plan.tdeeEstimate} kcal</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed font-medium">
            Strategy: {plan.calorieStrategy}
          </p>
        </div>

        {/* 3. Protein Target & Macros */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-600">Daily Protein Target</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-mono text-3xl font-extrabold text-blue-700 tabular-nums">
                {plan.proteinTargetGrams}g
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({plan.macronutrients.protein.percentage}%)
              </span>
            </div>
            {/* Visual Macro Distribution */}
            <div className="w-full h-2 rounded-full overflow-hidden flex my-2 bg-slate-100">
              <div
                style={{ width: `${plan.macronutrients.protein.percentage}%` }}
                className="bg-blue-600"
                title={`Protein: ${plan.macronutrients.protein.grams}g`}
              />
              <div
                style={{ width: `${plan.macronutrients.carbs.percentage}%` }}
                className="bg-emerald-500"
                title={`Carbs: ${plan.macronutrients.carbs.grams}g`}
              />
              <div
                style={{ width: `${plan.macronutrients.fats.percentage}%` }}
                className="bg-amber-500"
                title={`Fats: ${plan.macronutrients.fats.grams}g`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2">
            <span className="text-blue-700 font-semibold">P: {plan.macronutrients.protein.grams}g</span>
            <span className="text-emerald-700 font-semibold">C: {plan.macronutrients.carbs.grams}g</span>
            <span className="text-amber-700 font-semibold">F: {plan.macronutrients.fats.grams}g</span>
          </div>
        </div>

        {/* 4. Hydration Guidance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-600">Daily Hydration</span>
              <Droplets className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-3xl font-extrabold text-cyan-700 tabular-nums">
                {plan.hydration.dailyLiters}L
              </span>
              <span className="text-xs font-semibold text-slate-500">
                (~{plan.hydration.dailyGlasses} glasses)
              </span>
            </div>
            {/* Water glass indicators */}
            <div className="flex items-center gap-1 my-2">
              {Array.from({ length: Math.min(8, plan.hydration.dailyGlasses || 8) }).map((_, i) => (
                <div key={i} className="flex-1 h-3 rounded-sm bg-cyan-100 flex items-end overflow-hidden">
                  <div className="w-full bg-cyan-500 h-2.5" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {plan.hydration.guidance}
          </p>
        </div>
      </div>

      {/* Fitness Summary & Personal Strategy */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <Sparkles className="w-4 h-4" />
          <span>Strategic Executive Summary</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-normal">
          {plan.fitnessSummary}
        </p>
      </div>

      {/* Section Navigation Tabs (Segmented Control) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit no-print">
        <button
          onClick={() => setActiveTab('workouts')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'workouts'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Dumbbell className="w-3.5 h-3.5" />
            7-Day Workout Split & Demos
          </span>
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'nutrition'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Apple className="w-3.5 h-3.5" />
            Nutrition & Daily Meals
          </span>
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'safety'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Warm-up, Cool-down & Safety
          </span>
        </button>
      </div>

      {/* TAB 1: WORKOUT PLAN */}
      {activeTab === 'workouts' && (
        <div className="space-y-6">
          {/* 7-Day Day Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {plan.weeklySchedule.map((day) => {
              const isSelected = day.dayNumber === selectedDayNumber;
              return (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-700/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-mono font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      Day {day.dayNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        day.isRestDay
                          ? isSelected
                            ? 'bg-emerald-700 text-emerald-100'
                            : 'bg-slate-100 text-slate-600'
                          : isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {day.isRestDay ? 'Rest' : 'Workout'}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {day.focusTitle}
                  </h4>
                  {!day.isRestDay && (
                    <div className={`flex items-center gap-2 text-[10px] mt-1.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {day.targetDuration}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Day Header Banner */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
                  <span>Day {currentDay.dayNumber} of 7</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentDay.dayName}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {currentDay.focusTitle}
                </h2>
              </div>

              {!currentDay.isRestDay ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {currentDay.targetDuration}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      ~{currentDay.estimatedCaloriesBurned} kcal
                    </span>
                  </div>

                  {/* Completion badge */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500">Progress:</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {completedCount}/{totalDayExercises} ({dayProgressPct}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-xs font-semibold text-sky-800">
                  Active Recovery & Muscle Repair
                </div>
              )}
            </div>

            {/* Content: If Rest Day */}
            {currentDay.isRestDay ? (
              <div className="p-8 text-center max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Scheduled Rest & Recovery Day
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentDay.recoveryTip || 
                    "Muscles don't grow in the gym; they break down in the gym and rebuild stronger during rest. Focus on walking 6,000–8,000 steps, light joint mobility, hydration, and restful sleep."}
                </p>
                <div className="pt-2 flex justify-center gap-4 text-xs text-slate-500 font-medium">
                  <span>✓ 7-8 hours sleep</span>
                  <span>✓ Complete hydration</span>
                  <span>✓ Gentle mobility</span>
                </div>
              </div>
            ) : (
              /* Content: Workout Exercises List */
              <div className="divide-y divide-slate-100">
                {currentDay.exercises.map((exercise, idx) => {
                  const isDone = !!completedExercises[`d${selectedDayNumber}-e${idx}`];

                  return (
                    <div
                      key={idx}
                      className={`p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                        isDone ? 'bg-emerald-50/30' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Left: Exercise metadata & cues */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleExerciseComplete(selectedDayNumber, idx)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'border-slate-300 bg-white hover:border-emerald-500 text-transparent'
                            }`}
                            title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-slate-400">
                                #{idx + 1}
                              </span>
                              <h3 className={`text-base font-bold transition-all ${
                                isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                              }`}>
                                {exercise.name}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Targets: <span className="font-medium text-slate-700">{exercise.targetedMuscles}</span>
                            </p>
                          </div>
                        </div>

                        {/* Form cue */}
                        {exercise.formCues && (
                          <div className="pl-9 text-xs text-slate-600 leading-relaxed">
                            <span className="font-semibold text-slate-700">Form Cue: </span>
                            {exercise.formCues}
                          </div>
                        )}
                      </div>

                      {/* Right: Metrics & Actions */}
                      <div className="pl-9 lg:pl-0 flex flex-wrap items-center gap-3 shrink-0">
                        {/* Sets & Reps badge */}
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Volume</span>
                          <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                            {exercise.sets} sets × {exercise.reps}
                          </span>
                        </div>

                        {/* Rest timer button */}
                        <button
                          onClick={() => handleStartRestTimer(exercise.restSeconds, exercise.name)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-center transition-colors cursor-pointer group"
                          title="Launch rest countdown"
                        >
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold group-hover:text-emerald-700">
                            Rest
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums flex items-center gap-1 justify-center">
                            <Clock className="w-3 h-3" />
                            {exercise.restSeconds}s
                          </span>
                        </button>

                        {/* Animated Human Guide & In-App Video Button */}
                        <button
                          onClick={() => setSelectedExerciseForModal(exercise)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 rounded-lg transition-colors shadow-sm cursor-pointer"
                          title="View animated human demonstration and in-app video"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Animated Human & Video</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NUTRITION & DAILY MEALS */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                Personalized Macro Targets
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Daily Nutrition Blueprint
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Preference: <span className="font-medium text-slate-800">{plan.userProfile.dietaryPreference}</span> · 
                Allergies excluded: <span className="font-medium text-slate-800">{plan.userProfile.foodAllergies.join(', ') || 'None'}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Calories</span>
                <span className="font-bold text-slate-900 text-sm">{plan.calorieTarget} kcal</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-blue-700 block text-[10px]">Protein</span>
                <span className="font-bold text-blue-900 text-sm">{plan.proteinTargetGrams}g</span>
              </div>
            </div>
          </div>

          {/* 4 Daily Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {plan.dailyMeals.map((meal, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold uppercase tracking-wider text-emerald-700">
                      {meal.mealType}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      {meal.calories} kcal
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {meal.title}
                  </h3>

                  {/* Macros breakdown */}
                  <div className="flex items-center gap-3 text-[11px] font-mono mb-4 text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-blue-700 font-semibold">Protein: {meal.proteinGrams}g</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700">Carbs: {meal.carbsGrams}g</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700">Fats: {meal.fatsGrams}g</span>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                      Key Ingredients:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients.map((ing, i) => (
                        <span key={i} className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                      Preparation:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {meal.quickInstructions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hydration Timing Guidance */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
              <Droplets className="w-4 h-4" />
              <span>Optimal Hydration Schedule</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {plan.hydration.timingTips.map((tip, idx) => (
                <div key={idx} className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-cyan-900 block font-mono text-[11px]">Phase {idx + 1}</span>
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY, WARM-UP & COOL-DOWN */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          {/* Warmup & Cooldown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dynamic Warmup */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700">
                <Flame className="w-4 h-4" />
                <span>Pre-Workout Dynamic Warm-up (5–8 mins)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Elevate core temperature and lubricate joint synovial fluid with dynamic movements before lifting.
              </p>
              <ul className="space-y-2.5 pt-1">
                {plan.warmupCooldownGuide.warmup.map((drill, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-700 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{drill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Static Cool-down */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Activity className="w-4 h-4" />
                <span>Post-Workout Cool-Down & Mobility (5 mins)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Downregulate your nervous system and lengthen worked muscle bellies to prevent stiffness.
              </p>
              <ul className="space-y-2.5 pt-1">
                {plan.warmupCooldownGuide.cooldown.map((stretch, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{stretch}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Safety Recommendations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety & Injury Prevention Principles</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {plan.safetyRecommendations.map((safetyItem, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  <span className="leading-relaxed">{safetyItem}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Modal for Selected Exercise */}
      {selectedExerciseForModal && (
        <ExerciseVisualModal
          exercise={selectedExerciseForModal}
          onClose={() => setSelectedExerciseForModal(null)}
          onStartRestTimer={handleStartRestTimer}
        />
      )}

      {/* Rest Timer Floating Widget */}
      {restTimerState.active && (
        <RestTimerModal
          initialSeconds={restTimerState.seconds}
          exerciseName={restTimerState.exerciseName}
          onClose={() => setRestTimerState({ active: false, seconds: 60 })}
        />
      )}
    </div>
  );
};
