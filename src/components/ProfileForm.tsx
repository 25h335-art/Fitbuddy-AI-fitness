import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  Scale, 
  Dumbbell, 
  Apple, 
  Calendar, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';
import { 
  UserFitnessProfile, 
  Gender, 
  FitnessGoal, 
  ActivityLevel, 
  WorkoutExperience, 
  DietaryPreference 
} from '../types/fitness';
import { PRESET_PROFILES } from '../data/presets';

interface ProfileFormProps {
  initialProfile?: UserFitnessProfile;
  onSubmit: (profile: UserFitnessProfile) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const COMMON_EQUIPMENT = [
  'Bodyweight',
  'Dumbbells',
  'Resistance Bands',
  'Barbells & Plates',
  'Kettlebells',
  'Cable Machine',
  'Pull-up Bar',
  'Cardio Machine (Bike/Treadmill)',
  'Full Commercial Gym'
];

const COMMON_ALLERGIES = [
  'None',
  'Peanuts',
  'Tree Nuts',
  'Dairy/Lactose',
  'Gluten/Wheat',
  'Eggs',
  'Soy',
  'Shellfish',
  'Fish'
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialProfile,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [profile, setProfile] = useState<UserFitnessProfile>(
    initialProfile || {
      age: 28,
      gender: 'Female',
      heightCm: 168,
      weightKg: 68,
      fitnessGoal: 'Weight Loss',
      activityLevel: 'Moderate',
      workoutExperience: 'Beginner',
      workoutDaysPerWeek: 4,
      workoutDuration: '30-45 min',
      availableEquipment: ['Bodyweight', 'Dumbbells'],
      dietaryPreference: 'Non-Vegetarian',
      foodAllergies: ['None'],
      dislikedFoods: ''
    }
  );

  const [customAllergy, setCustomAllergy] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Live BMI calculation
  const heightM = profile.heightCm > 0 ? profile.heightCm / 100 : 0;
  const liveBmi = heightM > 0 && profile.weightKg > 0 
    ? +(profile.weightKg / (heightM * heightM)).toFixed(1) 
    : 0;

  const getBmiBadge = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (bmi < 25) return { label: 'Normal weight', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Obesity range', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const handleEquipmentToggle = (item: string) => {
    setProfile((prev) => {
      const exists = prev.availableEquipment.includes(item);
      const next = exists 
        ? prev.availableEquipment.filter((eq) => eq !== item)
        : [...prev.availableEquipment, item];
      return { ...prev, availableEquipment: next.length > 0 ? next : ['Bodyweight'] };
    });
  };

  const handleAllergyToggle = (allergy: string) => {
    setProfile((prev) => {
      if (allergy === 'None') {
        return { ...prev, foodAllergies: ['None'] };
      }
      const filtered = prev.foodAllergies.filter((a) => a !== 'None');
      const exists = filtered.includes(allergy);
      const next = exists ? filtered.filter((a) => a !== allergy) : [...filtered, allergy];
      return { ...prev, foodAllergies: next.length > 0 ? next : ['None'] };
    });
  };

  const handleAddCustomAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAllergy.trim()) return;
    const clean = customAllergy.trim();
    setProfile((prev) => ({
      ...prev,
      foodAllergies: prev.foodAllergies.filter((a) => a !== 'None').concat(clean)
    }));
    setCustomAllergy('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (profile.age < 12 || profile.age > 100) {
      errors.push('Please enter a valid age between 12 and 100.');
    }
    if (profile.heightCm < 100 || profile.heightCm > 240) {
      errors.push('Please enter a valid height between 100cm and 240cm.');
    }
    if (profile.weightKg < 30 || profile.weightKg > 250) {
      errors.push('Please enter a valid weight between 30kg and 250kg.');
    }
    if (profile.workoutDaysPerWeek < 1 || profile.workoutDaysPerWeek > 7) {
      errors.push('Workout days per week must be between 1 and 7.');
    }
    if (!profile.availableEquipment || profile.availableEquipment.length === 0) {
      errors.push('Please select at least one available equipment option.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFormErrors([]);
    onSubmit(profile);
  };

  const loadPreset = (presetId: string) => {
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (found) {
      setProfile(found.profile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Fitness Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            FitBuddy uses these biometrics and lifestyle parameters to customize your 7-day plan.
          </p>
        </div>

        {/* Quick Presets Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Quick fill:</span>
          <select
            onChange={(e) => loadPreset(e.target.value)}
            defaultValue=""
            className="text-xs font-medium py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 transition-colors cursor-pointer"
          >
            <option value="" disabled>Select a Preset</option>
            {PRESET_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation Errors Notice */}
      {formErrors.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Please correct the following:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            {formErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Biometrics & Body Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">1. Body Biometrics & Baseline</h2>
              <p className="text-xs text-slate-500">Essential measurements for BMR and energy calculation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age (years)
              </label>
              <input
                type="number"
                min="14"
                max="95"
                required
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                min="100"
                max="240"
                required
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                min="30"
                max="250"
                step="0.5"
                required
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Live BMI Preview Bar */}
          {liveBmi > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">Calculated Baseline BMI:</span>
                <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                  {liveBmi}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getBmiBadge(liveBmi).color}`}>
                  {getBmiBadge(liveBmi).label}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                FitBuddy uses this to fine-tune your caloric threshold and nutrition targets.
              </span>
            </div>
          )}
        </div>

        {/* Section 2: Goals & Activity Level */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">2. Primary Goal & Daily Activity</h2>
              <p className="text-xs text-slate-500">Defines your energy balance and training style</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Fitness Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Fitness Goal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Weight Loss', 'Muscle Gain', 'Maintain Weight', 'General Fitness'] as FitnessGoal[]).map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => setProfile({ ...profile, fitnessGoal: goal })}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-left transition-all cursor-pointer ${
                      profile.fitnessGoal === goal
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{goal}</span>
                      {profile.fitnessGoal === goal && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Current Activity Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'Sedentary', desc: 'Desk job, little movement' },
                  { id: 'Light', desc: '1-2 light active days/wk' },
                  { id: 'Moderate', desc: '3-4 active days/wk' },
                  { id: 'Very Active', desc: '5+ intense days/physical job' }
                ] as { id: ActivityLevel; desc: string }[]).map((lvl) => (
                  <button
                    type="button"
                    key={lvl.id}
                    onClick={() => setProfile({ ...profile, activityLevel: lvl.id })}
                    className={`p-2.5 text-xs rounded-xl border text-left transition-all cursor-pointer ${
                      profile.activityLevel === lvl.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{lvl.id}</span>
                      {profile.activityLevel === lvl.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{lvl.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Workout Schedule & Equipment */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">3. Workout Schedule & Equipment</h2>
              <p className="text-xs text-slate-500">Tailored strictly to what gear you have and your weekly availability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Workout Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Workout Experience
              </label>
              <select
                value={profile.workoutExperience}
                onChange={(e) => setProfile({ ...profile, workoutExperience: e.target.value as WorkoutExperience })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Beginner">Beginner (0-6 months)</option>
                <option value="Intermediate">Intermediate (6 months - 2 years)</option>
                <option value="Advanced">Advanced (2+ years)</option>
              </select>
            </div>

            {/* Days Per Week */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Workout Days per Week
              </label>
              <select
                value={profile.workoutDaysPerWeek}
                onChange={(e) => setProfile({ ...profile, workoutDaysPerWeek: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={2}>2 Days / week</option>
                <option value={3}>3 Days / week (Full Body Split)</option>
                <option value={4}>4 Days / week (Upper / Lower)</option>
                <option value={5}>5 Days / week (Push / Pull / Legs)</option>
                <option value={6}>6 Days / week (Advanced)</option>
              </select>
            </div>

            {/* Workout Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Workout Duration
              </label>
              <select
                value={profile.workoutDuration}
                onChange={(e) => setProfile({ ...profile, workoutDuration: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="15-30 min">15-30 min (Express / HIIT)</option>
                <option value="30-45 min">30-45 min (Balanced)</option>
                <option value="45-60 min">45-60 min (Standard Gym)</option>
                <option value="60+ min">60+ min (Comprehensive)</option>
              </select>
            </div>
          </div>

          {/* Equipment Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Available Equipment (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_EQUIPMENT.map((item) => {
                const checked = profile.availableEquipment.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleEquipmentToggle(item)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors flex items-center justify-between cursor-pointer ${
                      checked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Nutrition & Dietary Preferences */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Apple className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">4. Nutrition, Allergies & Preferences</h2>
              <p className="text-xs text-slate-500">Ensures meal suggestions are safe, compliant, and enjoyable</p>
            </div>
          </div>

          {/* Dietary Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Dietary Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Pescatarian'] as DietaryPreference[]).map((diet) => (
                <button
                  type="button"
                  key={diet}
                  onClick={() => setProfile({ ...profile, dietaryPreference: diet })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    profile.dietaryPreference === diet
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Food Allergies (Strictly Excluded)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_ALLERGIES.map((allergy) => {
                const checked = profile.foodAllergies.includes(allergy);
                return (
                  <button
                    type="button"
                    key={allergy}
                    onClick={() => handleAllergyToggle(allergy)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors flex items-center justify-between cursor-pointer ${
                      checked
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{allergy}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                );
              })}
            </div>

            {/* Custom allergy input */}
            <div className="mt-2.5 flex gap-2">
              <input
                type="text"
                placeholder="Other allergy (e.g. sesame, mustard)..."
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomAllergy}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Add Allergy
              </button>
            </div>
          </div>

          {/* Disliked Foods */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Foods You Dislike (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. mushrooms, cilantro, olives, bitter melon..."
              value={profile.dislikedFoods}
              onChange={(e) => setProfile({ ...profile, dislikedFoods: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Gemini will avoid these ingredients when generating your daily recipes.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-md shadow-emerald-600/25 hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate My Personalized Plan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
