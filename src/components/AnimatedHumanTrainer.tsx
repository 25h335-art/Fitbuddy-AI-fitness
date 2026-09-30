import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Activity, Gauge, Check, Sparkles, HelpCircle } from 'lucide-react';

interface AnimatedHumanTrainerProps {
  exerciseName: string;
  targetedMuscles: string;
  intensity: string;
}

export const AnimatedHumanTrainer: React.FC<AnimatedHumanTrainerProps> = ({
  exerciseName,
  targetedMuscles,
  intensity
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1); // 0.5, 1, 1.5
  const [timelineProgress, setTimelineProgress] = useState<number>(0); // 0 to 1
  const [repCount, setRepCount] = useState<number>(1);
  const [phaseName, setPhaseName] = useState<string>('Setup & Brace');
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Determine movement archetype
  const nameLower = exerciseName.toLowerCase();
  const isSquat = nameLower.includes('squat') || nameLower.includes('leg press');
  const isDeadlift = nameLower.includes('deadlift') || nameLower.includes('hinge') || nameLower.includes('rdl');
  const isPress = nameLower.includes('press') || nameLower.includes('push-up') || nameLower.includes('pushup') || nameLower.includes('dip');
  const isPull = nameLower.includes('pull') || nameLower.includes('row') || nameLower.includes('chin') || nameLower.includes('lat');
  const isLunge = nameLower.includes('lunge') || nameLower.includes('split squat') || nameLower.includes('step-up');
  const isPlank = nameLower.includes('plank') || nameLower.includes('hold') || nameLower.includes('crunch') || nameLower.includes('core');
  const isCurl = nameLower.includes('curl');
  const isShoulderPress = nameLower.includes('overhead') || (nameLower.includes('shoulder') && nameLower.includes('press'));

  // Store continuous time for smooth loop
  const animTimeRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const repCounterRef = useRef<number>(1);

  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      if (!prevTimeRef.current) prevTimeRef.current = time;
      const deltaTime = (time - prevTimeRef.current) / 1000;
      prevTimeRef.current = time;

      if (isPlaying && !isScrubbing) {
        // Cycle duration: 3.4 seconds per full repetition at 1x
        const cycleDuration = 3.4 / speed;
        animTimeRef.current = (animTimeRef.current + deltaTime) % cycleDuration;
        const normalized = animTimeRef.current / cycleDuration;
        setTimelineProgress(normalized);

        // Rep Counter tracking
        const currentRep = Math.floor(time / (cycleDuration * 1000)) % 10 + 1;
        if (currentRep !== repCounterRef.current) {
          repCounterRef.current = currentRep;
          setRepCount(currentRep);
        }
      }

      drawCanvas(timelineProgress);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isScrubbing, speed, timelineProgress, exerciseName]);

  // Main high-performance 60fps canvas drawer
  const drawCanvas = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with modern gym floor gradient
    ctx.clearRect(0, 0, width, height);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.7, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Architectural grid floor with perspective
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 260);
      ctx.lineTo(x * 1.2 - width * 0.1, height);
      ctx.stroke();
    }
    for (let y = 280; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Floor line
    const floorY = 320;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, floorY);
    ctx.lineTo(width - 30, floorY);
    ctx.stroke();

    // Calculate kinematic movement depth 'd' (0 = start, 1 = peak bottom, 0 = return)
    // 0 -> 0.45: eccentric (lowering)
    // 0.45 -> 0.55: isometric pause
    // 0.55 -> 1.0: concentric (lifting)
    let d = 0;
    let currentPhase = '1. Setup & Breath';
    let muscleIntensity = 0.3;

    if (progress < 0.45) {
      const p = progress / 0.45;
      // Smooth sinusoidal deceleration into bottom
      d = Math.sin((p * Math.PI) / 2);
      currentPhase = '2. Eccentric (Controlled Lowering)';
      muscleIntensity = 0.4 + d * 0.4;
    } else if (progress <= 0.55) {
      d = 1.0;
      currentPhase = '3. Isometric Peak Contraction';
      muscleIntensity = 1.0; // Max activation glow
    } else {
      const p = (progress - 0.55) / 0.45;
      // Explosive concentric drive back to top
      d = Math.cos((p * Math.PI) / 2);
      currentPhase = '4. Concentric (Power Drive)';
      muscleIntensity = 0.9 - p * 0.5;
    }

    setPhaseName(currentPhase);

    // Realistic anatomical limb drawing helpers
    const drawShadow = (centerX: number, centerY: number, radiusX: number, radiusY: number, alpha: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fill();
      ctx.restore();
    };

    const drawBoneLimb = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      thickness: number,
      color: string,
      glowColor?: string,
      glowAlpha?: number
    ) => {
      ctx.save();
      if (glowColor && glowAlpha && glowAlpha > 0.05) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12 * glowAlpha;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    const drawJoint = (x: number, y: number, radius: number, color = '#e2e8f0') => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawHead = (x: number, y: number, facingRight = true, angle = 0) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Skull & face
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 17, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      // Jaw contour
      ctx.beginPath();
      ctx.moveTo(facingRight ? 4 : -4, 2);
      ctx.lineTo(facingRight ? 13 : -13, 5);
      ctx.lineTo(facingRight ? 6 : -6, 14);
      ctx.lineTo(0, 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();

      // Hair
      ctx.beginPath();
      ctx.arc(0, -5, 14, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Ear
      ctx.beginPath();
      ctx.arc(facingRight ? -2 : 2, 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();

      ctx.restore();
    };

    const drawBarbell = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.save();
      // Metallic bar
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Knurling center marks
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(midX - 20, midY);
      ctx.lineTo(midX + 20, midY);
      ctx.stroke();

      // Left & Right weight plates
      [
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      ].forEach((plate) => {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(plate.x - 5, plate.y - 20, 10, 40);
        ctx.fillStyle = '#047857';
        ctx.fillRect(plate.x - 2, plate.y - 14, 4, 28);
      });
      ctx.restore();
    };

    const drawDumbbell = (cx: number, cy: number, length = 32, angle = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Handle
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-length / 2, 0);
      ctx.lineTo(length / 2, 0);
      ctx.stroke();

      // Hexagonal Rubber Heads
      [-length / 2, length / 2].forEach((x) => {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(x, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    // Color definitions for muscle active states
    const activeMuscleColor = '#10b981';
    const restingBodyColor = '#cbd5e1';
    const shortsColor = '#1e293b';

    // -------------------------------------------------------------
    // EXERCISE 1: SQUAT KINEMATICS (Full Depth, True Spine & Knee Angles)
    // -------------------------------------------------------------
    if (isSquat) {
      // Midfoot grounded anchor
      const footX = 290;
      const footY = floorY;

      // Ankle joint stays stationary
      const ankleX = footX;
      const ankleY = footY - 8;

      // Knee moves forward and down as depth increases
      const kneeX = footX + d * 32;
      const kneeY = ankleY - (110 - d * 35);

      // Hip moves backward and down (thigh parallel at d=1)
      const hipX = footX - 10 - d * 65;
      const hipY = kneeY - (25 - d * 25);

      // Torso angles forward to balance weight over midfoot
      const torsoAngle = 0.15 + d * 0.55; // Radians from vertical
      const torsoLength = 95;
      const shoulderX = hipX + Math.sin(torsoAngle) * torsoLength;
      const shoulderY = hipY - Math.cos(torsoAngle) * torsoLength;

      // Head remains neutral
      const headX = shoulderX + Math.sin(torsoAngle * 0.7) * 28;
      const headY = shoulderY - Math.cos(torsoAngle * 0.7) * 28;

      // Barbell resting securely on upper traps
      const barX = shoulderX - 2;
      const barY = shoulderY + 4;

      // Dynamic floor shadow shrinks/widens
      drawShadow(footX, floorY + 4, 45 + d * 15, 9, 0.4 + d * 0.3);

      // Foot & Shoe
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(ankleX - 15, ankleY + 8);
      ctx.lineTo(ankleX + 22, ankleY + 8);
      ctx.lineTo(ankleX + 18, ankleY + 2);
      ctx.lineTo(ankleX - 10, ankleY);
      ctx.closePath();
      ctx.fill();

      // Lower leg / Shin
      drawBoneLimb(ankleX, ankleY, kneeX, kneeY, 13, restingBodyColor);
      drawJoint(kneeX, kneeY, 7);

      // Thigh / Quadriceps & Gluteus (Active Muscle Glow)
      drawBoneLimb(kneeX, kneeY, hipX, hipY, 20, activeMuscleColor, activeMuscleColor, muscleIntensity);

      // Pelvis / Athletic Training Shorts
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.rotate(torsoAngle);
      ctx.fillStyle = shortsColor;
      ctx.beginPath();
      ctx.roundRect(-16, -12, 32, 28, 6);
      ctx.fill();
      ctx.restore();

      // Torso & Spine with Erector Spinae & Core Activation
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 22, restingBodyColor, activeMuscleColor, muscleIntensity * 0.6);

      // Arms gripping the barbell
      const elbowX = shoulderX - 14;
      const elbowY = shoulderY + 28;
      drawBoneLimb(shoulderX, shoulderY, elbowX, elbowY, 9, restingBodyColor);
      drawBoneLimb(elbowX, elbowY, barX + 15, barY, 8, restingBodyColor);

      // Head & Athletic Profile
      drawHead(headX, headY, true, torsoAngle * 0.4);

      // Olympic Barbell (Front-facing cross bar)
      drawBarbell(barX - 70, barY, barX + 70, barY);
    }

    // -------------------------------------------------------------
    // EXERCISE 2: PUSH-UP / CHEST PRESS KINEMATICS
    // -------------------------------------------------------------
    else if (isPress) {
      // Toes anchored on floor
      const toeX = 140;
      const toeY = floorY - 5;

      // Hands anchored on floor
      const handX = 390;
      const handY = floorY - 5;

      // Body drops as rigid plank from top to bottom
      // At d = 0 (top): shoulder is high, arms straight
      // At d = 1 (bottom): chest touches floor, elbows flex back
      const shoulderX = handX;
      const shoulderY = floorY - 140 + d * 105;

      const hipX = toeX + (shoulderX - toeX) * 0.55;
      const hipY = toeY + (shoulderY - toeY) * 0.55;

      const kneeX = toeX + (hipX - toeX) * 0.5;
      const kneeY = toeY + (hipY - toeY) * 0.5;

      const headX = shoulderX + 35;
      const headY = shoulderY - 8;

      // Elbow flexes backward at 45 degrees
      const elbowX = handX - 35 - d * 25;
      const elbowY = (shoulderY + handY) / 2 + d * 10;

      // Floor Shadow under entire body
      drawShadow((toeX + handX) / 2, floorY + 4, 140, 10, 0.4 + d * 0.35);

      // Shoes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(toeX - 18, toeY - 4, 20, 10);

      // Rigid Legs & Pelvis
      drawBoneLimb(toeX, toeY, kneeX, kneeY, 14, restingBodyColor);
      drawBoneLimb(kneeX, kneeY, hipX, hipY, 18, restingBodyColor);

      // Active Torso & Pectorals Glow
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 22, activeMuscleColor, activeMuscleColor, muscleIntensity);

      // Arms (Pectorals, Triceps, Deltoids)
      drawBoneLimb(shoulderX, shoulderY, elbowX, elbowY, 12, activeMuscleColor, activeMuscleColor, muscleIntensity * 0.8);
      drawBoneLimb(elbowX, elbowY, handX, handY, 10, restingBodyColor);
      drawJoint(handX, handY, 6, '#475569');

      // Head
      drawHead(headX, headY, true, 0.1);
    }

    // -------------------------------------------------------------
    // EXERCISE 3: BENT-OVER ROW / PULL KINEMATICS
    // -------------------------------------------------------------
    else if (isPull) {
      // Athletic hinged stance
      const footX = 260;
      const footY = floorY;
      const ankleX = footX;
      const ankleY = footY - 8;

      // Soft knees
      const kneeX = ankleX + 20;
      const kneeY = ankleY - 80;

      // Hips hinged back at 45 degrees
      const hipX = ankleX - 35;
      const hipY = kneeY - 70;

      // Torso flat back at 35 degrees to horizontal
      const torsoAngle = Math.PI / 4.5;
      const shoulderX = hipX + Math.cos(torsoAngle) * 115;
      const shoulderY = hipY - Math.sin(torsoAngle) * 115;

      const headX = shoulderX + 28;
      const headY = shoulderY - 14;

      // Row pulling path: weights start hanging, pulled to lower ribs
      const startHandX = shoulderX;
      const startHandY = shoulderY + 115;
      const endHandX = hipX + 45;
      const endHandY = hipY - 20;

      const handX = startHandX + (endHandX - startHandX) * d;
      const handY = startHandY + (endHandY - startHandY) * d;

      // Elbow flares back and up
      const elbowX = shoulderX - 15 - d * 35;
      const elbowY = shoulderY + 50 - d * 45;

      drawShadow(footX, floorY + 4, 60, 9, 0.4);

      // Legs
      drawBoneLimb(ankleX, ankleY, kneeX, kneeY, 13, restingBodyColor);
      drawBoneLimb(kneeX, kneeY, hipX, hipY, 19, restingBodyColor);

      // Back / Latissimus Dorsi & Rhomboids Glow
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 22, activeMuscleColor, activeMuscleColor, muscleIntensity);

      // Arms (Biceps & Rear Delts)
      drawBoneLimb(shoulderX, shoulderY, elbowX, elbowY, 11, restingBodyColor);
      drawBoneLimb(elbowX, elbowY, handX, handY, 10, activeMuscleColor, activeMuscleColor, muscleIntensity * 0.7);

      // Dumbbell in hand
      drawDumbbell(handX, handY, 34, 0.2);

      drawHead(headX, headY, true, 0.3);
    }

    // -------------------------------------------------------------
    // EXERCISE 4: ROMANIAN DEADLIFT (RDL) / HINGE KINEMATICS
    // -------------------------------------------------------------
    else if (isDeadlift) {
      const footX = 280;
      const footY = floorY;
      const ankleX = footX;
      const ankleY = footY - 8;

      // Knees remain slightly unlocked (soft knee hinge)
      const kneeX = ankleX + 10;
      const kneeY = ankleY - 90;

      // Hips shoot straight back horizontally
      const hipX = ankleX - 10 - d * 55;
      const hipY = kneeY - (65 - d * 15);

      // Torso pivots forward from vertical to 70 degrees
      const spineAngle = 0.1 + d * 1.05; // Radians
      const spineLength = 100;
      const shoulderX = hipX + Math.sin(spineAngle) * spineLength;
      const shoulderY = hipY - Math.cos(spineAngle) * spineLength;

      const headX = shoulderX + Math.sin(spineAngle) * 26;
      const headY = shoulderY - Math.cos(spineAngle) * 26;

      // Barbell tracks in a pure vertical line down the shins!
      const barX = footX + 15;
      const barY = shoulderY + (100 - d * 20);

      drawShadow(footX, floorY + 4, 60 + d * 15, 9, 0.45);

      // Lower leg
      drawBoneLimb(ankleX, ankleY, kneeX, kneeY, 13, restingBodyColor);

      // Hamstrings & Glutes (Max stretch and tension)
      drawBoneLimb(kneeX, kneeY, hipX, hipY, 20, activeMuscleColor, activeMuscleColor, muscleIntensity);

      // Spine & Erector Spinae
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 22, activeMuscleColor, activeMuscleColor, muscleIntensity * 0.7);

      // Arms hanging straight down with barbell
      drawBoneLimb(shoulderX, shoulderY, barX, barY, 10, restingBodyColor);
      drawBarbell(barX - 60, barY, barX + 60, barY);

      drawHead(headX, headY, true, spineAngle * 0.8);
    }

    // -------------------------------------------------------------
    // EXERCISE 5: LUNGE / SPLIT SQUAT KINEMATICS
    // -------------------------------------------------------------
    else if (isLunge) {
      // Front foot planted forward
      const frontFootX = 350;
      const frontAnkleX = frontFootX;
      const frontAnkleY = floorY - 8;

      // Rear foot anchored on toes
      const rearToeX = 190;
      const rearToeY = floorY - 5;

      // When lowered (d = 1):
      // Front knee at 90 deg, front thigh horizontal
      const frontKneeX = frontAnkleX;
      const frontKneeY = frontAnkleY - (110 - d * 35);

      const hipX = frontKneeX - (75 - d * 15);
      const hipY = frontKneeY - (25 - d * 25);

      // Rear knee drops straight down to hover 1 inch off floor
      const rearKneeX = rearToeX + 25;
      const rearKneeY = floorY - 100 + d * 85;

      // Torso stays perfectly upright
      const shoulderX = hipX;
      const shoulderY = hipY - 95;
      const headX = shoulderX;
      const headY = shoulderY - 26;

      drawShadow(frontFootX, floorY + 4, 40, 8, 0.4);
      drawShadow(rearToeX, floorY + 4, 30, 7, 0.35);

      // Rear Leg
      drawBoneLimb(rearToeX, rearToeY, rearKneeX, rearKneeY, 12, restingBodyColor);
      drawBoneLimb(rearKneeX, rearKneeY, hipX, hipY, 16, restingBodyColor);

      // Front Leg (Quadriceps & Glute Medius active glow)
      drawBoneLimb(frontAnkleX, frontAnkleY, frontKneeX, frontKneeY, 13, restingBodyColor);
      drawBoneLimb(frontKneeX, frontKneeY, hipX, hipY, 20, activeMuscleColor, activeMuscleColor, muscleIntensity);

      // Upright Torso
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 22, restingBodyColor);

      // Dumbbells held at sides
      const handX = hipX + 15;
      const handY = hipY + 10;
      drawBoneLimb(shoulderX, shoulderY, handX, handY, 9, restingBodyColor);
      drawDumbbell(handX, handY, 28, 0);

      drawHead(headX, headY, true, 0);
    }

    // -------------------------------------------------------------
    // EXERCISE 6: PLANK / CORE ISOMETRIC STABILIZATION
    // -------------------------------------------------------------
    else if (isPlank) {
      const toeX = 140;
      const toeY = floorY - 5;
      const elbowX = 390;
      const elbowY = floorY - 8;

      // Subtle diaphragmatic breathing expansion
      const breath = Math.sin(progress * Math.PI * 4) * 4;

      const shoulderX = elbowX;
      const shoulderY = elbowY - 45;

      const hipX = toeX + (shoulderX - toeX) * 0.55;
      const hipY = toeY + (shoulderY - toeY) * 0.55 + breath;

      const kneeX = (toeX + hipX) / 2;
      const kneeY = (toeY + hipY) / 2;

      const headX = shoulderX + 35;
      const headY = shoulderY - 4;

      drawShadow((toeX + elbowX) / 2, floorY + 4, 130, 9, 0.45);

      // Forearm on floor
      drawBoneLimb(elbowX, elbowY, elbowX + 30, elbowY, 10, '#64748b');

      // Rigid bodyline
      drawBoneLimb(toeX, toeY, kneeX, kneeY, 13, restingBodyColor);
      drawBoneLimb(kneeX, kneeY, hipX, hipY, 18, restingBodyColor);

      // Core Abdominal Wall (Pulsing Energy Glow)
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 24, activeMuscleColor, activeMuscleColor, 0.7 + breath * 0.05);

      // Upper arm
      drawBoneLimb(shoulderX, shoulderY, elbowX, elbowY, 12, restingBodyColor);

      drawHead(headX, headY, true, 0.05);
    }

    // -------------------------------------------------------------
    // EXERCISE 7: BICEP CURL / ARM MOVEMENT
    // -------------------------------------------------------------
    else if (isCurl) {
      const footX = 290;
      const footY = floorY;
      const ankleX = footX;
      const ankleY = footY - 8;
      const kneeX = ankleX;
      const kneeY = ankleY - 95;
      const hipX = kneeX;
      const hipY = kneeY - 90;
      const shoulderX = hipX;
      const shoulderY = hipY - 95;
      const headX = shoulderX;
      const headY = shoulderY - 26;

      // Elbow stays glued to torso side
      const elbowX = shoulderX;
      const elbowY = shoulderY + 50;

      // Forearm curls in an upward arc
      // d = 0: hand hanging at hip (300, 230)
      // d = 1: hand curled to front shoulder (325, 120)
      const curlAngle = 0.1 + d * 2.3; // Radians
      const forearmLen = 55;
      const handX = elbowX + Math.sin(curlAngle) * forearmLen;
      const handY = elbowY + Math.cos(curlAngle) * forearmLen;

      drawShadow(footX, floorY + 4, 45, 8, 0.4);

      // Standing body
      drawBoneLimb(ankleX, ankleY, kneeX, kneeY, 13, restingBodyColor);
      drawBoneLimb(kneeX, kneeY, hipX, hipY, 18, restingBodyColor);
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 22, restingBodyColor);

      // Upper arm & Biceps (Swelling active peak)
      drawBoneLimb(
        shoulderX,
        shoulderY,
        elbowX,
        elbowY,
        14 + d * 6,
        activeMuscleColor,
        activeMuscleColor,
        muscleIntensity
      );
      // Forearm
      drawBoneLimb(elbowX, elbowY, handX, handY, 10, restingBodyColor);

      // Dumbbell
      drawDumbbell(handX, handY, 30, -curlAngle);

      drawHead(headX, headY, true, 0);
    }

    // -------------------------------------------------------------
    // EXERCISE 8: DEFAULT STANDING OVERHEAD PRESS
    // -------------------------------------------------------------
    else {
      const footX = 290;
      const footY = floorY;
      const ankleX = footX;
      const ankleY = footY - 8;
      const kneeX = ankleX;
      const kneeY = ankleY - 95;
      const hipX = kneeX;
      const hipY = kneeY - 90;
      const shoulderX = hipX;
      const shoulderY = hipY - 95;
      const headX = shoulderX;
      const headY = shoulderY - 26;

      // Press from shoulder level (d=0) to full overhead lockout (d=1)
      const elbowX = shoulderX + 15 - d * 10;
      const elbowY = shoulderY + 40 - d * 55;

      const handX = shoulderX + 20 - d * 15;
      const handY = shoulderY - 10 - d * 70;

      drawShadow(footX, floorY + 4, 45, 8, 0.4);

      drawBoneLimb(ankleX, ankleY, kneeX, kneeY, 13, restingBodyColor);
      drawBoneLimb(kneeX, kneeY, hipX, hipY, 18, restingBodyColor);
      drawBoneLimb(hipX, hipY, shoulderX, shoulderY, 22, restingBodyColor);

      // Shoulders & Triceps active glow
      drawBoneLimb(shoulderX, shoulderY, elbowX, elbowY, 13, activeMuscleColor, activeMuscleColor, muscleIntensity);
      drawBoneLimb(elbowX, elbowY, handX, handY, 10, activeMuscleColor, activeMuscleColor, muscleIntensity * 0.8);

      // Dumbbell
      drawDumbbell(handX, handY, 32, 0);

      drawHead(headX, headY, true, 0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTimelineProgress(val);
    drawCanvas(val);
  };

  return (
    <div className="relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top HUD Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Biomechanic Kinematic Simulation · 60 FPS
            </h4>
            <p className="text-[11px] text-emerald-400 font-medium">
              Phase: <span className="text-slate-100 font-semibold">{phaseName}</span>
            </p>
          </div>
        </div>

        {/* Speed Controls & Rep Counter */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs">
            <span className="text-slate-400 font-mono">Rep:</span>
            <span className="font-bold text-white font-mono">{repCount}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            {[0.5, 1.0, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                  speed === s ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={`Playback speed ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>

      {/* Main 60 FPS Canvas Stage */}
      <div className="relative w-full h-80 sm:h-96 flex items-center justify-center bg-slate-950">
        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          className="w-full h-full object-contain"
        />

        {/* Form Coaching Points Floating HUD */}
        <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/70 text-xs text-slate-200 max-w-[240px] space-y-1 shadow-lg pointer-events-none">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <Check className="w-3.5 h-3.5" />
            <span>Active Joint Alignment</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {isSquat && 'Knees track over midfoot · Vertical bar path · Neutral spine'}
            {isPress && 'Rigid plank line · Elbows at 45° · Full chest excursion'}
            {isPull && 'Spine neutral at 45° · Scapular retraction · Elbows past ribs'}
            {isDeadlift && 'Hip hinge mechanics · Bar stays glued to shins'}
            {isLunge && '90° knee angles · Upright torso · Drive through front heel'}
            {isPlank && 'Horizontal spine line · Transverse abdominal activation'}
            {isCurl && 'Elbows pinned to ribs · Peak bicep squeeze'}
            {!isSquat && !isPress && !isPull && !isDeadlift && !isLunge && !isPlank && !isCurl &&
              'Controlled eccentric lowering · Explosive concentric drive'}
          </p>
        </div>

        {/* Prime Movers Indicator */}
        <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/70 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Prime Movers: <strong className="text-emerald-400 font-semibold">{targetedMuscles}</strong></span>
        </div>
      </div>

      {/* Interactive Scrubbing Slider Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-400 shrink-0">Scrub Form:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.005"
          value={timelineProgress}
          onMouseDown={() => setIsScrubbing(true)}
          onMouseUp={() => setIsScrubbing(false)}
          onTouchStart={() => setIsScrubbing(true)}
          onTouchEnd={() => setIsScrubbing(false)}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          title="Drag slider to study biomechanical form at any stage"
        />
        <span className="text-[10px] font-mono text-emerald-400 shrink-0">
          {Math.round(timelineProgress * 100)}%
        </span>
      </div>
    </div>
  );
};
