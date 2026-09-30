import jsPDF from 'jspdf';
import { FitnessPlan } from '../types/fitness';

export function downloadFitnessPlanPDF(plan: FitnessPlan): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 1.5, 'F');
    y += 5;
  };

  // --- 1. COVER HEADER ---
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FitBuddy · AI Fitness & Nutrition Plan', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Goal: ${plan.userProfile.fitnessGoal}  |  Generated: ${new Date(plan.createdAt || Date.now()).toLocaleDateString()}`,
    margin + 6,
    y + 16
  );
  doc.text(
    `Profile: ${plan.userProfile.gender}, ${plan.userProfile.age}y  |  ${plan.userProfile.heightCm}cm  |  ${plan.userProfile.weightKg}kg  |  ${plan.userProfile.workoutExperience}`,
    margin + 6,
    y + 21
  );

  y += 30;

  // --- 2. EXECUTIVE SUMMARY & BIOMETRICS ---
  checkPageBreak(35);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Metabolic Targets & Body Biometrics', margin + 4, y + 7);

  doc.setFontSize(9);
  // Column 1: BMI & Weight
  doc.setFont('helvetica', 'bold');
  doc.text(`BMI: ${plan.bmi} (${plan.bmiCategory})`, margin + 4, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`BMR: ${plan.bmrEstimate} kcal  |  TDEE: ${plan.tdeeEstimate} kcal`, margin + 4, y + 21);
  doc.text(`Calorie Target: ${plan.calorieTarget} kcal/day`, margin + 4, y + 27);
  doc.text(`Daily Hydration: ${plan.hydration.dailyLiters}L (~${plan.hydration.dailyGlasses} glasses)`, margin + 4, y + 33);

  // Column 2: Macronutrients
  const col2X = margin + 95;
  doc.setFont('helvetica', 'bold');
  doc.text(`Protein Target: ${plan.proteinTargetGrams}g (${plan.macronutrients.protein.percentage}%)`, col2X, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`Carbohydrates: ${plan.macronutrients.carbs.grams}g (${plan.macronutrients.carbs.percentage}%)`, col2X, y + 21);
  doc.text(`Dietary Fats: ${plan.macronutrients.fats.grams}g (${plan.macronutrients.fats.percentage}%)`, col2X, y + 27);
  doc.text(`Strategy: ${plan.calorieStrategy.slice(0, 48)}...`, col2X, y + 33);

  y += 44;

  // --- 3. 7-DAY WORKOUT SPLIT ---
  checkPageBreak(15);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('7-Day Workout Schedule & Exercise Guide', margin, y);
  y += 6;

  plan.weeklySchedule.forEach((day) => {
    checkPageBreak(25);

    // Day Header
    doc.setFillColor(day.isRestDay ? 241 : 236, day.isRestDay ? 245 : 253, day.isRestDay ? 249 : 245);
    doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(day.isRestDay ? 71 : 4, day.isRestDay ? 85 : 120, day.isRestDay ? 105 : 87);
    doc.text(
      `${day.dayName.toUpperCase()}: ${day.focusTitle} ${day.isRestDay ? '(Rest & Recovery)' : `· ${day.targetDuration} · ~${day.estimatedCaloriesBurned} kcal`}`,
      margin + 3,
      y + 5
    );
    y += 9;

    if (day.isRestDay) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        day.recoveryTip || 'Active recovery: Light walking (6,000-8,000 steps), joint mobility, hydration, and restful sleep.',
        margin + 4,
        y + 2
      );
      y += 8;
    } else {
      // Exercise items
      day.exercises.forEach((ex, idx) => {
        checkPageBreak(13);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 11, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${idx + 1}. ${ex.name}`, margin + 3, y + 4.5);

        // Sets / reps / rest
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(5, 150, 105);
        doc.text(`${ex.sets} sets × ${ex.reps}  (Rest: ${ex.restSeconds}s)`, margin + 110, y + 4.5);

        // Targeted muscles & cue
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const cueText = ex.formCues ? `Cue: ${ex.formCues.slice(0, 85)}` : `Targets: ${ex.targetedMuscles}`;
        doc.text(cueText, margin + 5, y + 9);

        y += 12;
      });
      y += 3;
    }
  });

  // --- 4. DAILY MEAL SUGGESTIONS ---
  checkPageBreak(20);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Daily Nutrition & Meal Suggestions', margin, y);
  y += 6;

  plan.dailyMeals.forEach((meal) => {
    checkPageBreak(22);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 19, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${meal.mealType.toUpperCase()}: ${meal.title}`, margin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105);
    doc.text(`${meal.calories} kcal  |  Protein: ${meal.proteinGrams}g  |  Carbs: ${meal.carbsGrams}g  |  Fats: ${meal.fatsGrams}g`, margin + 105, y + 5);

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Ingredients: ${meal.ingredients.slice(0, 5).join(', ')}`, margin + 3, y + 10);
    doc.text(`Prep: ${meal.quickInstructions.slice(0, 115)}`, margin + 3, y + 15);

    y += 22;
  });

  // --- 5. SAFETY & WARMUP PROTOCOLS ---
  checkPageBreak(25);
  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('Warm-Up & Injury Prevention Protocol', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  doc.text('· Dynamic Warm-up (5 mins): Arm circles, bodyweight hip openers, cat-cow stretches, and light squats.', margin + 4, y + 11);
  doc.text('· Rhythmic Breathing: Exhale forcefully on the concentric push/pull phase; inhale smoothly on the eccentric lowering.', margin + 4, y + 16);
  doc.text('· Cool-Down (5 mins): Static quadriceps, hamstring stretches, and doorway chest stretch held for 30s each.', margin + 4, y + 21);

  y += 28;

  // --- 6. MANDATORY HEALTHCARE DISCLAIMER ---
  checkPageBreak(18);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('IMPORTANT MEDICAL & HEALTHCARE DISCLAIMER', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'This is general wellness and fitness guidance, not professional medical advice. Always consult a qualified healthcare professional',
    margin + 4,
    y + 9
  );
  doc.text(
    'before beginning any exercise or diet program, especially if you have pre-existing medical conditions, injuries, pregnancy, or eating concerns.',
    margin + 4,
    y + 13
  );

  // Trigger instant direct download in browser
  const filename = `FitBuddy_${plan.userProfile.fitnessGoal.replace(/\s+/g, '_')}_Plan.pdf`;
  doc.save(filename);
}
