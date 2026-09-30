export type Gender = 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';

export type FitnessGoal = 
  | 'Weight Loss'
  | 'Muscle Gain'
  | 'Maintain Weight'
  | 'General Fitness';

export type ActivityLevel = 
  | 'Sedentary'
  | 'Light'
  | 'Moderate'
  | 'Very Active';

export type WorkoutExperience = 
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced';

export type DietaryPreference = 
  | 'Vegetarian'
  | 'Non-Vegetarian'
  | 'Vegan'
  | 'Pescatarian';

export interface UserFitnessProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  workoutExperience: WorkoutExperience;
  workoutDaysPerWeek: number;
  workoutDuration: string;
  availableEquipment: string[];
  dietaryPreference: DietaryPreference;
  foodAllergies: string[];
  dislikedFoods: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  targetedMuscles: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  formCues: string;
  intensity: 'Low' | 'Moderate' | 'High';
  videoDemoQuery?: string;
  stepByStepGuide?: string[];
  mistakesToAvoid?: string[];
}

export interface DayWorkout {
  dayNumber: number;
  dayName: string;
  focusTitle: string;
  isRestDay: boolean;
  targetDuration: string;
  estimatedCaloriesBurned: number;
  exercises: Exercise[];
  recoveryTip?: string;
}

export interface MealSuggestion {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  title: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  ingredients: string[];
  quickInstructions: string;
}

export interface MacroTarget {
  grams: number;
  percentage: number;
}

export interface HydrationPlan {
  dailyLiters: number;
  dailyGlasses: number;
  guidance: string;
  timingTips: string[];
}

export interface FitnessPlan {
  id: string;
  createdAt: string;
  userProfile: UserFitnessProfile;
  fitnessSummary: string;
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity';
  bmiAdvice: string;
  calorieTarget: number;
  bmrEstimate: number;
  tdeeEstimate: number;
  calorieStrategy: string;
  proteinTargetGrams: number;
  macronutrients: {
    protein: MacroTarget;
    carbs: MacroTarget;
    fats: MacroTarget;
    explanation: string;
  };
  hydration: HydrationPlan;
  weeklySchedule: DayWorkout[];
  dailyMeals: MealSuggestion[];
  safetyRecommendations: string[];
  warmupCooldownGuide: {
    warmup: string[];
    cooldown: string[];
  };
  medicalDisclaimer: string;
}
