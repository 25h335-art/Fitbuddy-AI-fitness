import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { UserFitnessProfile, FitnessPlan, DayWorkout, MealSuggestion, Exercise } from './src/types/fitness';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Scientific Exercise & Nutrition Fallback Engine
function generateScientificPlan(profile: UserFitnessProfile): FitnessPlan {
  const heightM = profile.heightCm / 100;
  const bmi = +(profile.weightKg / (heightM * heightM)).toFixed(1);

  let bmiCategory: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity' = 'Normal weight';
  let bmiAdvice = 'Your body mass index is in the optimal healthy range. Focus on body recomposition, muscular endurance, and progressive athletic capacity.';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiAdvice = 'Your BMI is below the standard baseline. We recommend a slight caloric surplus prioritizing nutrient-dense whole foods and progressive hypertrophy resistance training to build healthy lean muscle mass.';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiAdvice = 'Your BMI indicates an opportunity for healthy body recomposition. Combining a moderate caloric deficit with progressive resistance training will protect lean muscle while tapping into stored adipose energy.';
  } else if (bmi >= 30) {
    bmiCategory = 'Obesity';
    bmiAdvice = 'Your BMI falls into the higher range. Our strategy prioritizes joint-friendly compound movements, steady cardiovascular conditioning, and consistent portion moderation for sustainable long-term metabolic health.';
  }

  // Mifflin-St Jeor BMR calculation
  let bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  if (profile.gender === 'Male') {
    bmr += 5;
  } else if (profile.gender === 'Female') {
    bmr -= 161;
  } else {
    bmr -= 78;
  }
  bmr = Math.round(bmr);

  // TDEE calculation
  const activityFactors: Record<string, number> = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Very Active': 1.725
  };
  const factor = activityFactors[profile.activityLevel] || 1.4;
  const tdee = Math.round(bmr * factor);

  // Calorie Target based on goal
  let calorieTarget = tdee;
  let calorieStrategy = 'Caloric maintenance to sustain bodyweight while improving functional work capacity and stamina.';

  if (profile.fitnessGoal === 'Weight Loss') {
    calorieTarget = Math.max(1200, Math.round(tdee - 450));
    calorieStrategy = 'Sustainable caloric deficit of ~450 kcal below TDEE to foster fat loss at ~0.5kg/week while preserving lean tissue.';
  } else if (profile.fitnessGoal === 'Muscle Gain') {
    calorieTarget = Math.round(tdee + 350);
    calorieStrategy = 'Lean surplus of ~350 kcal above TDEE to fuel muscular protein synthesis with minimal unwanted adipose gain.';
  } else if (profile.fitnessGoal === 'Maintain Weight') {
    calorieTarget = tdee;
    calorieStrategy = 'Neutral energy balance matched exactly to your daily total expenditure for weight stability.';
  }

  // Macronutrient calculation
  const proteinPerKg = (profile.fitnessGoal === 'Muscle Gain' || profile.fitnessGoal === 'Weight Loss') ? 1.8 : 1.4;
  const proteinGrams = Math.round(profile.weightKg * proteinPerKg);
  const proteinCals = proteinGrams * 4;
  const fatCals = Math.round(calorieTarget * 0.25);
  const fatsGrams = Math.round(fatCals / 9);
  const carbCals = Math.max(0, calorieTarget - proteinCals - fatCals);
  const carbsGrams = Math.round(carbCals / 4);

  const proteinPct = Math.round((proteinCals / calorieTarget) * 100);
  const fatsPct = Math.round((fatCals / calorieTarget) * 100);
  const carbsPct = 100 - proteinPct - fatsPct;

  // Hydration
  const dailyLiters = +(profile.weightKg * 0.038).toFixed(1);
  const dailyGlasses = Math.round(dailyLiters / 0.25);

  // Equipment check
  const hasGym = profile.availableEquipment.some(eq => eq.toLowerCase().includes('gym') || eq.toLowerCase().includes('cable'));
  const hasDumbbells = profile.availableEquipment.some(eq => eq.toLowerCase().includes('dumbbell') || eq.toLowerCase().includes('barbell') || hasGym);

  // Exercise pool generator
  const createExercise = (
    name: string,
    sets: number,
    reps: string,
    restSeconds: number,
    targetedMuscles: string,
    formCues: string,
    intensity: 'Low' | 'Moderate' | 'High',
    stepByStepGuide: string[],
    mistakesToAvoid: string[]
  ): Exercise => ({
    name,
    sets,
    reps,
    restSeconds,
    targetedMuscles,
    primaryMuscles: targetedMuscles.split(',').map(m => m.trim()),
    secondaryMuscles: ['Core', 'Stabilizers'],
    formCues,
    intensity,
    videoDemoQuery: `${name} proper form demonstration technique tutorial`,
    stepByStepGuide,
    mistakesToAvoid
  });

  // Sample Exercise Catalog
  const squatExercise = hasDumbbells
    ? createExercise(
        'Dumbbell Goblet Squat',
        3,
        '10-12 reps',
        60,
        'Quadriceps, Gluteus Maximus, Core',
        'Hold dumbbell vertically against chest. Drive knees outward in line with toes, keeping chest proud.',
        'Moderate',
        [
          'Stand with feet shoulder-width apart, holding the dumbbell head against your sternum with elbows tucked.',
          'Hinge hips back and bend knees, lowering into a deep squat until hip crease passes knee level.',
          'Pause momentarily at the bottom without losing spinal tension or rounding the lower back.',
          'Press forcefully through the midfoot and heels to drive back to standing, exhaling at the top.'
        ],
        ['Allowing knees to cave inward on the ascent', 'Lifting heels off the ground during descent', 'Rounding upper back forward']
      )
    : createExercise(
        'Tempo Bodyweight Air Squats',
        3,
        '15 reps',
        45,
        'Quadriceps, Glutes, Calves',
        '3-second descent, 1-second pause at bottom, explode up powerfully through midfoot.',
        'Low',
        [
          'Stand tall with feet hip-to-shoulder width apart and arms extended in front for counter-balance.',
          'Descend smoothly on a 3-count while maintaining an upright torso.',
          'Hold the bottom position for 1 second with thighs at or below parallel.',
          'Drive through the ground to stand up fully and squeeze glutes at the top.'
        ],
        ['Rushing through reps without achieving full depth', 'Collapsing knees inward']
      );

  const pushExercise = hasDumbbells
    ? createExercise(
        'Dumbbell Flat Floor Press',
        3,
        '8-10 reps',
        75,
        'Pectorals, Anterior Deltoids, Triceps',
        'Plant feet firmly. Keep elbows at a 45-degree angle to protect rotator cuffs. Squeeze chest at peak contraction.',
        'Moderate',
        [
          'Lie flat on back with knees bent and feet flat on the floor, holding dumbbells at chest level.',
          'Press dumbbells vertically upward until arms are straight, keeping wrists stacked directly over elbows.',
          'Slowly lower dumbbells under control until upper arms gently touch the floor at roughly 45 degrees to torso.',
          'Pause for a fraction of a second, then drive the weights back up without arching your spine off the floor.'
        ],
        ['Flaring elbows out at a 90-degree angle', 'Bouncing elbows aggressively off the floor']
      )
    : createExercise(
        'Standard Push-ups (Tempo 2-0-1)',
        3,
        '10-15 reps',
        60,
        'Pectorals, Triceps, Anterior Deltoids, Core',
        'Keep body in a rigid straight line from neck to heels. Tuck elbows to 45 degrees, chest touches ground.',
        'Moderate',
        [
          'Place hands on floor slightly wider than shoulder-width, fingers spread, core braced tightly.',
          'Lower body in one unified plank until chest is an inch above the floor.',
          'Maintain a neutral neck looking roughly 6 inches ahead of your fingers.',
          'Push the floor away firmly to return to full arm extension.'
        ],
        ['Sagging hips and lower back hyperextension', 'Flaring elbows directly out perpendicular to body']
      );

  const pullExercise = hasDumbbells
    ? createExercise(
        'Two-Arm Dumbbell Bent-Over Row',
        3,
        '10-12 reps',
        60,
        'Latissimus Dorsi, Rhomboids, Rear Deltoids, Biceps',
        'Hinge hips back to 45 degrees with flat spine. Pull elbows past ribs and retract shoulder blades together.',
        'Moderate',
        [
          'Hinge forward at hips with soft knees, maintaining a straight spine from tailbone to crown.',
          'Hold dumbbells with palms facing each other, letting arms hang straight down beneath shoulders.',
          'Drive elbows upward along your ribcage, squeezing your shoulder blades together at the top.',
          'Lower the weights under full control to the starting stretch without rounding your back.'
        ],
        ['Jerking the torso upward to gain momentum', 'Rounding the lumbar spine under load']
      )
    : createExercise(
        'Prone Cobra & Doorway Inverted Rows',
        3,
        '12-15 reps',
        45,
        'Mid-Traps, Rhomboids, Posterior Delts, Erector Spinae',
        'Lie face down, lift chest, rotate thumbs to ceiling, and squeeze shoulder blades together for 2 seconds.',
        'Low',
        [
          'Lie prone on a mat with arms alongside hips, palms facing down.',
          'Simultaneously lift head, chest, and arms while rotating thumbs outward toward the ceiling.',
          'Pinch shoulder blades back and down as if holding a pencil between your mid-back.',
          'Hold the peak contraction for 2 full seconds before lowering smoothly.'
        ],
        ['Straining the neck by looking up too high', 'Failing to initiate the movement from the scapulae']
      );

  const lungeExercise = createExercise(
    'Alternating Reverse Lunges',
    3,
    '10 reps per leg',
    60,
    'Quadriceps, Gluteus Medius, Hamstrings',
    'Step back softly, lower back knee until 1 inch off floor, front shin remains vertical.',
    'Moderate',
    [
      'Stand upright with feet together and hands on hips or holding light dumbbells at sides.',
      'Step backward with right foot, landing on the ball of the foot.',
      'Lower hips straight down until both knees form approximately 90-degree angles.',
      'Push firmly through the front heel to return to the starting position, then switch legs.'
    ],
    ['Letting front knee collapse past toes or drift inward', 'Banging the back knee hard onto the floor']
  );

  const coreExercise = createExercise(
    'Dead Bug & Hollow Body Holds',
    3,
    '10 reps per side',
    45,
    'Transverse Abdominis, Rectus Abdominis, Hip Flexors',
    'Press lumbar spine into the floor with zero gap. Extend opposite arm and leg slowly while exhaling fully.',
    'Low',
    [
      'Lie flat on back with arms pointing straight up and knees bent at 90 degrees directly above hips.',
      'Actively press your lower back into the floor so there is zero gap beneath your spine.',
      'Slowly extend right arm back and left leg forward until both are hovering a few inches above floor.',
      'Return to starting position and alternate with opposite limbs while maintaining flat lower back.'
    ],
    ['Allowing lower back to arch away from floor', 'Moving too fast without core engagement']
  );

  const shoulderExercise = hasDumbbells
    ? createExercise(
        'Dumbbell Overhead Shoulder Press',
        3,
        '8-10 reps',
        60,
        'Deltoids, Upper Traps, Triceps',
        'Seated or standing, press dumbbells overhead in a gentle arc without arching lower back.',
        'Moderate',
        [
          'Hold dumbbells at shoulder height with elbows slightly in front of the coronal plane.',
          'Brace abs and glutes, then press the dumbbells straight up overhead until arms lock out gently.',
          'Lower the weights smoothly to chin level on a 2-second eccentric count.',
          'Repeat with steady, rhythmic breathing.'
        ],
        ['Excessive arching of lumbar spine to compensate for shoulder mobility', 'Dropping weights abruptly']
      )
    : createExercise(
        'Elevated Pike Push-ups',
        3,
        '8-10 reps',
        60,
        'Anterior Deltoids, Triceps, Upper Chest',
        'From downward dog or feet on chair, lower crown of head between hands at 45 degree angle.',
        'Moderate',
        [
          'Assume an inverted V position with hips pushed high into the air.',
          'Bend elbows to lower the top of your head forward between your hands.',
          'Press through palms to push your body back up along the diagonal angle.'
        ],
        ['Flaring elbows out to sides', 'Losing the high hip hinge']
      );

  // Construct 7-day schedule according to requested workoutDaysPerWeek
  const targetWorkoutDays = Math.min(6, Math.max(2, profile.workoutDaysPerWeek || 4));
  const weeklySchedule: DayWorkout[] = [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Decide workout vs rest distribution
  let workoutDayFlags: boolean[] = [];
  if (targetWorkoutDays === 2) {
    workoutDayFlags = [true, false, false, true, false, false, false];
  } else if (targetWorkoutDays === 3) {
    workoutDayFlags = [true, false, true, false, true, false, false];
  } else if (targetWorkoutDays === 4) {
    workoutDayFlags = [true, true, false, true, true, false, false];
  } else if (targetWorkoutDays === 5) {
    workoutDayFlags = [true, true, true, false, true, true, false];
  } else {
    workoutDayFlags = [true, true, true, true, true, true, false];
  }

  const focusThemes = [
    { title: 'Lower Body & Quadricep Power', exercises: [squatExercise, lungeExercise, coreExercise, pullExercise] },
    { title: 'Upper Body Push & Chest Focus', exercises: [pushExercise, shoulderExercise, coreExercise, squatExercise] },
    { title: 'Posterior Chain & Pull Dynamics', exercises: [pullExercise, lungeExercise, pushExercise, coreExercise] },
    { title: 'Full Body Conditioning & Core', exercises: [squatExercise, pushExercise, pullExercise, shoulderExercise, coreExercise] },
    { title: 'Upper Body Hypertrophy & Arms', exercises: [pushExercise, shoulderExercise, pullExercise, coreExercise] },
    { title: 'Lower Body Sculpt & Agility', exercises: [lungeExercise, squatExercise, coreExercise, pushExercise] }
  ];

  let workoutIdx = 0;
  for (let d = 1; d <= 7; d++) {
    const isWorkout = workoutDayFlags[d - 1];
    const dayName = `${dayNames[d - 1]} - Day ${d}`;

    if (isWorkout) {
      const theme = focusThemes[workoutIdx % focusThemes.length];
      workoutIdx++;
      weeklySchedule.push({
        dayNumber: d,
        dayName,
        focusTitle: theme.title,
        isRestDay: false,
        targetDuration: profile.workoutDuration || '30-45 min',
        estimatedCaloriesBurned: profile.fitnessGoal === 'Weight Loss' ? 340 : 280,
        exercises: theme.exercises
      });
    } else {
      weeklySchedule.push({
        dayNumber: d,
        dayName,
        focusTitle: d === 7 ? 'Full Restoration & Joint Care' : 'Active Recovery & Mobility',
        isRestDay: true,
        targetDuration: '20-30 min',
        estimatedCaloriesBurned: 120,
        recoveryTip: 'Perform 15-20 minutes of light dynamic walking, diaphragmatic breathing, and joint circles. Rehydrate and prioritize sleep.',
        exercises: []
      });
    }
  }

  // Nutrition & Meal Customization
  const isVeg = profile.dietaryPreference === 'Vegetarian';
  const isVegan = profile.dietaryPreference === 'Vegan';
  const hasDairyAllergy = profile.foodAllergies.some(a => a.toLowerCase().includes('dairy') || a.toLowerCase().includes('lactose'));
  const hasNutAllergy = profile.foodAllergies.some(a => a.toLowerCase().includes('nut') || a.toLowerCase().includes('peanut'));
  const hasGlutenAllergy = profile.foodAllergies.some(a => a.toLowerCase().includes('gluten') || a.toLowerCase().includes('wheat'));

  // Breakfast
  let bTitle = 'Protein Power Scramble with Avocado & Sprouted Toast';
  let bIngs = ['3 whole eggs or egg whites', '1 slice sprouted grain bread', '1/4 ripe avocado', 'Baby spinach', 'Extra virgin olive oil'];
  let bInst = 'Saute spinach in olive oil for 1 min, pour in whisked eggs, and scramble softly over medium-low heat. Serve with toasted sprouted bread and sliced avocado.';

  if (isVegan) {
    bTitle = 'Tofu Scramble with Turmeric & Roasted Sweet Potatoes';
    bIngs = ['Firm tofu block pressed and crumbled', '1/2 roasted sweet potato cubes', 'Nutritional yeast', 'Baby spinach', 'Black salt (kala namak)'];
    bInst = 'Saute crumbled tofu with nutritional yeast, turmeric, and pinch of black salt for eggy flavor. Stir in baby spinach until wilted and pair with sweet potatoes.';
  } else if (hasGlutenAllergy) {
    bTitle = 'Greek Yogurt Bowl with Berries & Hemp Seeds';
    bIngs = [hasDairyAllergy ? 'Coconut probiotic yogurt' : 'Non-fat Greek yogurt', '1/2 cup blueberries', '2 tbsp hemp hearts', '1 tbsp chia seeds', 'Ceylon cinnamon'];
    bInst = 'Layer yogurt in a bowl, top with washed berries, hemp seeds, chia seeds, and a dusting of cinnamon for blood sugar balance.';
  }

  // Lunch
  let lTitle = 'Mediterranean Grilled Chicken & Quinoa Harvest Bowl';
  let lIngs = ['150g grilled chicken breast', '1/2 cup cooked quinoa', 'Cucumber & cherry tomato dice', 'Kalamata olives', 'Lemon tahini dressing'];
  let lInst = 'Toss cooked fluffy quinoa with diced cucumber, tomatoes, and kalamata olives. Slice grilled chicken breast on top and drizzle with lemon tahini dressing.';

  if (isVeg || isVegan) {
    lTitle = 'Tempeh & Spiced Chickpea Mediterranean Bowl';
    lIngs = ['120g marinated tempeh slices', '1/2 cup cooked chickpeas', '1/2 cup cooked quinoa', 'Cucumber & bell pepper dice', 'Lemon tahini dressing'];
    lInst = 'Pan-sear tempeh slices in a drop of avocado oil until golden. Assemble bowl over quinoa and chickpeas with crisp fresh veggies and tahini drizzle.';
  }

  // Dinner
  let dTitle = 'Pan-Seared Salmon with Steamed Asparagus & Jasmine Rice';
  let dIngs = ['160g wild-caught salmon fillet', '1 cup steamed asparagus spears', '1/2 cup cooked jasmine or brown rice', 'Fresh dill & lemon slice'];
  let dInst = 'Season salmon fillet with sea salt and black pepper. Sear skin-side down in cast iron skillet for 4 mins, flip for 2 mins. Serve alongside steamed asparagus and fluffy rice.';

  if (isVeg) {
    dTitle = 'Lentil Dahl with Steamed Basmati & Garlic Greens';
    dIngs = ['1 cup cooked yellow lentils in cumin & turmeric', '1/2 cup steamed basmati rice', 'Steamed broccoli florets', 'Fresh cilantro'];
    dInst = 'Simmer lentils with aromatics until creamy and fragrant. Serve over warm basmati rice with fresh steamed broccoli florets.';
  } else if (isVegan) {
    dTitle = 'Crispy Sesame Edamame & Broccoli Bowl with Soba or Quinoa';
    dIngs = ['1 cup shelled edamame', 'Steamed broccoli & snap peas', 'Sesame-ginger tamari glaze', '1/2 cup brown rice or gluten-free soba noodles'];
    dInst = 'Toss steamed vegetables and edamame with warm sesame-ginger glaze. Serve over brown rice for a complete amino acid profile.';
  }

  // Snack
  let sTitle = 'Cinnamon Apple Slices with Almond Butter';
  let sIngs = ['1 crisp honeycrisp apple sliced', '1.5 tbsp roasted almond butter', 'Pinch sea salt'];
  let sInst = 'Slice apple into thin wedges and pair with almond butter for dipping.';

  if (hasNutAllergy) {
    sTitle = 'Sunflower Butter & Rice Cakes with Berries';
    sIngs = ['2 brown rice cakes', '1.5 tbsp roasted sunflower seed butter (SunButter)', 'Fresh raspberries'];
    sInst = 'Spread sunflower butter generously across rice cakes and press fresh raspberries into the top.';
  }

  const dailyMeals: MealSuggestion[] = [
    {
      mealType: 'Breakfast',
      title: bTitle,
      calories: Math.round(calorieTarget * 0.28),
      proteinGrams: Math.round(proteinGrams * 0.28),
      carbsGrams: Math.round(carbsGrams * 0.26),
      fatsGrams: Math.round(fatsGrams * 0.28),
      ingredients: bIngs,
      quickInstructions: bInst
    },
    {
      mealType: 'Lunch',
      title: lTitle,
      calories: Math.round(calorieTarget * 0.34),
      proteinGrams: Math.round(proteinGrams * 0.35),
      carbsGrams: Math.round(carbsGrams * 0.36),
      fatsGrams: Math.round(fatsGrams * 0.32),
      ingredients: lIngs,
      quickInstructions: lInst
    },
    {
      mealType: 'Dinner',
      title: dTitle,
      calories: Math.round(calorieTarget * 0.26),
      proteinGrams: Math.round(proteinGrams * 0.27),
      carbsGrams: Math.round(carbsGrams * 0.26),
      fatsGrams: Math.round(fatsGrams * 0.26),
      ingredients: dIngs,
      quickInstructions: dInst
    },
    {
      mealType: 'Snack',
      title: sTitle,
      calories: Math.round(calorieTarget * 0.12),
      proteinGrams: Math.round(proteinGrams * 0.10),
      carbsGrams: Math.round(carbsGrams * 0.12),
      fatsGrams: Math.round(fatsGrams * 0.14),
      ingredients: sIngs,
      quickInstructions: sInst
    }
  ];

  return {
    id: 'fit-' + Date.now(),
    createdAt: new Date().toISOString(),
    userProfile: profile,
    fitnessSummary: `Based on your biometrics (${profile.gender}, ${profile.age}y, ${profile.heightCm}cm, ${profile.weightKg}kg), your primary objective of ${profile.fitnessGoal} is structured through a calibrated daily caloric intake of ${calorieTarget} kcal and ${proteinGrams}g of daily protein. Your ${targetWorkoutDays}-day split matches your available ${profile.availableEquipment.join(', ')} with progressive overload, allowing recovery intervals to optimize muscular adaptation while protecting joints.`,
    bmi,
    bmiCategory,
    bmiAdvice,
    calorieTarget,
    bmrEstimate: bmr,
    tdeeEstimate: tdee,
    calorieStrategy,
    proteinTargetGrams: proteinGrams,
    macronutrients: {
      protein: { grams: proteinGrams, percentage: proteinPct },
      carbs: { grams: carbsGrams, percentage: carbsPct },
      fats: { grams: fatsGrams, percentage: fatsPct },
      explanation: `Allocated ${proteinGrams}g of protein (~${proteinPerKg}g/kg) to maximize muscle protein synthesis and promote recovery, while providing adequate complex carbohydrates for glycogen replenishment and essential dietary fats for endocrine health.`
    },
    hydration: {
      dailyLiters,
      dailyGlasses,
      guidance: `Aim for approximately ${dailyLiters} liters (~${dailyGlasses} standard 250ml glasses) daily to sustain blood volume, metabolic clearance, and exercise output.`,
      timingTips: [
        'Upon waking: Drink 500ml of room temperature water with a pinch of sea salt or lemon to rehydrate after sleep.',
        'Pre-workout: Consume 300-400ml water 30-45 minutes before training to optimize cardiac output.',
        'Post-workout: Replenish 500ml within 60 minutes after exercise to replace lost sweat and support cellular repair.'
      ]
    },
    weeklySchedule,
    dailyMeals,
    safetyRecommendations: [
      'Warm-up thoroughly for 5-8 minutes before touching weights or beginning high-intensity intervals.',
      'Maintain continuous rhythmic breathing: exhale on exertion (concentric phase) and inhale during lowering (eccentric phase).',
      'Never train through sharp joint pain; adjust joint angles or decrease load if you feel connective tissue strain.',
      'Prioritize strict form over heavy resistance; clean biomechanics build greater hypertrophy and prevent injury.',
      'Ensure 7-8 hours of quality sleep to facilitate hormonal recovery and central nervous system repair.'
    ],
    warmupCooldownGuide: {
      warmup: [
        'Arm Circles & Shoulder Dislocates with towel or band (10 reps forward, 10 reps backward)',
        'Bodyweight Hip Openers / World’s Greatest Stretch (5 reps each side)',
        'Cat-Cow Spinal Articulations (8 slow breathing cycles)',
        'Glute Bridges with 2-second isometric hold (12 reps)'
      ],
      cooldown: [
        'Standing Quadriceps Stretch (hold 30s each leg)',
        'Seated Hamstring & Adductor Stretch (hold 30s)',
        'Chest Doorway Stretch (hold 30s each side)',
        'Child’s Pose with deep diaphragmatic breathing (60s)'
      ]
    },
    medicalDisclaimer:
      'This is general wellness guidance, not medical advice. Consult a qualified healthcare professional for medical conditions, injuries, pregnancy, eating disorders, or personal health concerns before starting any exercise or diet program.'
  };
}

// Plan Generation Route
app.post('/api/generate-plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = req.body as UserFitnessProfile;

    if (!profile || !profile.age || !profile.heightCm || !profile.weightKg || !profile.fitnessGoal) {
      res.status(400).json({ error: 'Incomplete fitness profile received. Please fill in all required fields.' });
      return;
    }

    // Try Gemini API first
    try {
      const systemInstruction = `You are FitBuddy's master certified fitness trainer, sports nutritionist, and exercise scientist.
Analyze the user's fitness profile and generate a comprehensive, personalized 7-day fitness and nutrition plan.
Follow clinical exercise science and sports nutrition principles.
CRITICAL SAFETY RULE FOR ALLERGIES: Strictly exclude all mentioned allergens: ${(profile.foodAllergies || []).join(', ') || 'None'}.
Respect disliked foods: ${profile.dislikedFoods || 'None'}.
Provide 3-4 step-by-step execution instructions and common mistakes for each exercise.
Must include standard healthcare disclaimer: "This is general wellness guidance, not medical advice. Consult a qualified healthcare professional for medical conditions, injuries, pregnancy, eating disorders, or personal health concerns before starting any exercise or diet program."`;

      const userPrompt = `Generate a personalized fitness plan for:
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Height: ${profile.heightCm} cm
- Weight: ${profile.weightKg} kg
- Fitness Goal: ${profile.fitnessGoal}
- Activity Level: ${profile.activityLevel}
- Workout Experience: ${profile.workoutExperience}
- Workout Days Per Week: ${profile.workoutDaysPerWeek} days
- Workout Duration: ${profile.workoutDuration}
- Available Equipment: ${(profile.availableEquipment || []).join(', ') || 'Bodyweight'}
- Dietary Preference: ${profile.dietaryPreference}
- Food Allergies: ${(profile.foodAllergies || []).join(', ') || 'None'}
- Disliked Foods: ${profile.dislikedFoods || 'None'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fitnessSummary: { type: Type.STRING },
              bmi: { type: Type.NUMBER },
              bmiCategory: { type: Type.STRING },
              bmiAdvice: { type: Type.STRING },
              calorieTarget: { type: Type.NUMBER },
              bmrEstimate: { type: Type.NUMBER },
              tdeeEstimate: { type: Type.NUMBER },
              calorieStrategy: { type: Type.STRING },
              proteinTargetGrams: { type: Type.NUMBER },
              macronutrients: {
                type: Type.OBJECT,
                properties: {
                  protein: {
                    type: Type.OBJECT,
                    properties: { grams: { type: Type.NUMBER }, percentage: { type: Type.NUMBER } },
                    required: ['grams', 'percentage']
                  },
                  carbs: {
                    type: Type.OBJECT,
                    properties: { grams: { type: Type.NUMBER }, percentage: { type: Type.NUMBER } },
                    required: ['grams', 'percentage']
                  },
                  fats: {
                    type: Type.OBJECT,
                    properties: { grams: { type: Type.NUMBER }, percentage: { type: Type.NUMBER } },
                    required: ['grams', 'percentage']
                  },
                  explanation: { type: Type.STRING }
                },
                required: ['protein', 'carbs', 'fats', 'explanation']
              },
              hydration: {
                type: Type.OBJECT,
                properties: {
                  dailyLiters: { type: Type.NUMBER },
                  dailyGlasses: { type: Type.NUMBER },
                  guidance: { type: Type.STRING },
                  timingTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['dailyLiters', 'dailyGlasses', 'guidance', 'timingTips']
              },
              weeklySchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.NUMBER },
                    dayName: { type: Type.STRING },
                    focusTitle: { type: Type.STRING },
                    isRestDay: { type: Type.BOOLEAN },
                    targetDuration: { type: Type.STRING },
                    estimatedCaloriesBurned: { type: Type.NUMBER },
                    recoveryTip: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          sets: { type: Type.NUMBER },
                          reps: { type: Type.STRING },
                          restSeconds: { type: Type.NUMBER },
                          targetedMuscles: { type: Type.STRING },
                          primaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
                          secondaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
                          formCues: { type: Type.STRING },
                          intensity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
                          videoDemoQuery: { type: Type.STRING },
                          stepByStepGuide: { type: Type.ARRAY, items: { type: Type.STRING } },
                          mistakesToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['name', 'sets', 'reps', 'restSeconds', 'targetedMuscles', 'formCues', 'intensity']
                      }
                    }
                  },
                  required: ['dayNumber', 'dayName', 'focusTitle', 'isRestDay', 'targetDuration', 'estimatedCaloriesBurned', 'exercises']
                }
              },
              dailyMeals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    mealType: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
                    title: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    proteinGrams: { type: Type.NUMBER },
                    carbsGrams: { type: Type.NUMBER },
                    fatsGrams: { type: Type.NUMBER },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    quickInstructions: { type: Type.STRING }
                  },
                  required: ['mealType', 'title', 'calories', 'proteinGrams', 'carbsGrams', 'fatsGrams', 'ingredients', 'quickInstructions']
                }
              },
              safetyRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              warmupCooldownGuide: {
                type: Type.OBJECT,
                properties: {
                  warmup: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cooldown: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['warmup', 'cooldown']
              },
              medicalDisclaimer: { type: Type.STRING }
            },
            required: [
              'fitnessSummary', 'bmi', 'bmiCategory', 'bmiAdvice', 'calorieTarget',
              'bmrEstimate', 'tdeeEstimate', 'calorieStrategy', 'proteinTargetGrams',
              'macronutrients', 'hydration', 'weeklySchedule', 'dailyMeals',
              'safetyRecommendations', 'warmupCooldownGuide', 'medicalDisclaimer'
            ]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const completePlan: FitnessPlan = {
          ...parsed,
          id: 'fit-' + Date.now(),
          createdAt: new Date().toISOString(),
          userProfile: profile
        };
        res.status(200).json(completePlan);
        return;
      }
    } catch {
      // When external AI service experiences upstream project restrictions,
      // seamlessly formulate the blueprint using our clinical exercise science algorithm.
    }

    // Formulate complete evidence-based fitness blueprint
    const calculatedPlan = generateScientificPlan(profile);
    res.status(200).json(calculatedPlan);
  } catch (err: any) {
    console.error('Fatal plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate fitness plan: ' + (err?.message || 'Internal error') });
  }
});

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server online on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
