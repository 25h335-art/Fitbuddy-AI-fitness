import { UserFitnessProfile } from '../types/fitness';

export interface PresetProfile {
  id: string;
  label: string;
  tag: string;
  profile: UserFitnessProfile;
}

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'fat-loss-home',
    label: 'Beginner Weight Loss',
    tag: 'Home Dumbbells · 3 Days',
    profile: {
      age: 29,
      gender: 'Female',
      heightCm: 165,
      weightKg: 72,
      fitnessGoal: 'Weight Loss',
      activityLevel: 'Light',
      workoutExperience: 'Beginner',
      workoutDaysPerWeek: 3,
      workoutDuration: '30-45 min',
      availableEquipment: ['Bodyweight', 'Dumbbells', 'Resistance Bands'],
      dietaryPreference: 'Non-Vegetarian',
      foodAllergies: ['None'],
      dislikedFoods: 'mushrooms, eggplant'
    }
  },
  {
    id: 'muscle-gain-gym',
    label: 'Muscle Hypertrophy',
    tag: 'Full Gym · 4 Days',
    profile: {
      age: 26,
      gender: 'Male',
      heightCm: 180,
      weightKg: 74,
      fitnessGoal: 'Muscle Gain',
      activityLevel: 'Moderate',
      workoutExperience: 'Intermediate',
      workoutDaysPerWeek: 4,
      workoutDuration: '45-60 min',
      availableEquipment: ['Full Commercial Gym', 'Barbells & Plates', 'Dumbbells', 'Cable Machine'],
      dietaryPreference: 'Non-Vegetarian',
      foodAllergies: ['None'],
      dislikedFoods: 'olives'
    }
  },
  {
    id: 'veg-general-fit',
    label: 'Vegetarian Vitality',
    tag: 'Plant-Based · 4 Days',
    profile: {
      age: 34,
      gender: 'Female',
      heightCm: 170,
      weightKg: 64,
      fitnessGoal: 'General Fitness',
      activityLevel: 'Moderate',
      workoutExperience: 'Intermediate',
      workoutDaysPerWeek: 4,
      workoutDuration: '30-45 min',
      availableEquipment: ['Bodyweight', 'Dumbbells', 'Kettlebells'],
      dietaryPreference: 'Vegetarian',
      foodAllergies: ['Dairy/Lactose'],
      dislikedFoods: 'tofu'
    }
  }
];
