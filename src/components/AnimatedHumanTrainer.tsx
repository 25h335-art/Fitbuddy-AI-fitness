import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Sparkles, Activity } from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1); // 0.5x, 1x, 1.5x
  const [activePhase, setActivePhase] = useState<'all' | 'eccentric' | 'concentric'>('all');

  const nameLower = exerciseName.toLowerCase();
  const isSquat = nameLower.includes('squat') || nameLower.includes('leg press');
  const isDeadlift = nameLower.includes('deadlift') || nameLower.includes('hinge') || nameLower.includes('rdl');
  const isPress = nameLower.includes('press') || nameLower.includes('push-up') || nameLower.includes('pushup') || nameLower.includes('dip');
  const isPull = nameLower.includes('pull') || nameLower.includes('row') || nameLower.includes('chin') || nameLower.includes('lat');
  const isLunge = nameLower.includes('lunge') || nameLower.includes('split squat') || nameLower.includes('step-up');
  const isPlank = nameLower.includes('plank') || nameLower.includes('hold') || nameLower.includes('crunch') || nameLower.includes('core');

  // Animation duration adjusted by speed
  const animDuration = `${3.2 / speed}s`;

  return (
    <div className="relative w-full bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col items-center">
      {/* Dynamic inline styles for smooth multi-phase human movement */}
      <style>{`
        @keyframes humanSquatAnim {
          0% { transform: translateY(0px); }
          45% { transform: translateY(38px); }
          55% { transform: translateY(38px); }
          100% { transform: translateY(0px); }
        }
        @keyframes squatThighAngle {
          0% { transform: rotate(0deg); }
          45% { transform: rotate(-55deg); }
          55% { transform: rotate(-55deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes squatShinAngle {
          0% { transform: rotate(0deg); }
          45% { transform: rotate(25deg); }
          55% { transform: rotate(25deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes humanPressAnim {
          0% { transform: translateY(0px); }
          45% { transform: translateY(28px); }
          55% { transform: translateY(28px); }
          100% { transform: translateY(0px); }
        }
        @keyframes humanRowAnim {
          0% { transform: translateY(0px); }
          45% { transform: translateY(-24px); }
          55% { transform: translateY(-24px); }
          100% { transform: translateY(0px); }
        }
        @keyframes humanDeadliftHinge {
          0% { transform: rotate(0deg); }
          45% { transform: rotate(48deg); }
          55% { transform: rotate(48deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes corePulseGlow {
          0%, 100% { opacity: 0.35; filter: drop-shadow(0 0 2px #10b981); }
          50% { opacity: 0.95; filter: drop-shadow(0 0 10px #10b981); }
        }
        @keyframes muscleFibersPulse {
          0%, 100% { fill: #10b981; opacity: 0.7; }
          50% { fill: #34d399; opacity: 1; filter: drop-shadow(0 0 8px #34d399); }
        }
      `}</style>

      {/* Header bar within canvas */}
      <div className="w-full px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Animated Human Biomechanical Model
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Speed:</span>
          {[0.5, 1, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors ${
                speed === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>
      </div>

      {/* Main Human Animation Stage */}
      <div className="relative w-full h-72 sm:h-80 flex items-center justify-center overflow-hidden p-2">
        {/* Subtle architectural gym grid background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Ambient lighting cones */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic Human Character SVG */}
        <svg
          viewBox="0 0 300 240"
          className="w-full h-full max-h-72 select-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="apparelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <filter id="humanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Floor platform with distance markers */}
          <line x1="20" y1="210" x2="280" y2="210" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <circle cx="150" cy="210" r="3" fill="#64748b" />
          <circle cx="100" cy="210" r="2" fill="#475569" />
          <circle cx="200" cy="210" r="2" fill="#475569" />

          {/* SQUAT MOVEMENT PATTERN */}
          {isSquat && (
            <g
              style={{
                animation: isPlaying ? `humanSquatAnim ${animDuration} ease-in-out infinite` : 'none',
                transformOrigin: '150px 210px'
              }}
            >
              {/* Human Head & Profile */}
              <g id="head" transform="translate(150, 48)">
                <ellipse cx="0" cy="0" rx="14" ry="17" fill="url(#skinGrad)" />
                {/* Athletic Jawline & Nose */}
                <path d="M 9 -2 Q 17 0 15 6 Q 12 15 3 16" fill="url(#skinGrad)" />
                {/* Athletic Hair */}
                <path d="M -13 -6 Q 0 -22 13 -6 Q 14 -18 -4 -20 Z" fill="#1e293b" />
                {/* Ear */}
                <circle cx="-1" cy="2" r="3.5" fill="#cbd5e1" />
              </g>

              {/* Muscular Neck & Trapezius */}
              <path d="M 143 64 L 143 74 L 157 74 L 157 64 Z" fill="url(#skinGrad)" />
              <path d="M 132 74 Q 150 67 168 74 L 165 85 L 135 85 Z" fill="url(#skinGrad)" />

              {/* Barbell / Dumbbell across shoulders */}
              <line x1="80" y1="72" x2="220" y2="72" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
              {/* Weight Plates with metallic rims */}
              <rect x="74" y="55" width="8" height="34" rx="3" fill="#10b981" />
              <rect x="83" y="60" width="5" height="24" rx="2" fill="#047857" />
              <rect x="218" y="55" width="8" height="34" rx="3" fill="#10b981" />
              <rect x="212" y="60" width="5" height="24" rx="2" fill="#047857" />

              {/* Athletic Torso / Chest / Abdomen */}
              <path d="M 134 78 Q 150 82 166 78 L 161 125 L 139 125 Z" fill="url(#skinGrad)" />
              {/* Pectorals & Abs */}
              <rect x="140" y="86" width="9" height="10" rx="2" fill="#cbd5e1" opacity="0.6" />
              <rect x="151" y="86" width="9" height="10" rx="2" fill="#cbd5e1" opacity="0.6" />
              {/* Active Core Glow */}
              <rect
                x="142"
                y="100"
                width="16"
                height="22"
                rx="3"
                fill="url(#muscleGrad)"
                style={{ animation: 'corePulseGlow 2s ease-in-out infinite' }}
              />

              {/* Arms gripping the barbell */}
              <path d="M 135 80 L 115 72" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 165 80 L 185 72" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />

              {/* Athletic Training Shorts / Pelvis */}
              <path d="M 137 122 L 163 122 L 166 142 L 134 142 Z" fill="url(#apparelGrad)" />

              {/* Left Thigh (Quadriceps activation glow) */}
              <path
                d="M 139 140 Q 130 162 135 178 L 145 178 Q 148 160 147 140 Z"
                fill="url(#muscleGrad)"
                filter="url(#humanGlow)"
                style={{ animation: 'muscleFibersPulse 2s infinite' }}
              />
              {/* Right Thigh */}
              <path
                d="M 153 140 Q 152 160 155 178 L 165 178 Q 170 162 161 140 Z"
                fill="url(#muscleGrad)"
                filter="url(#humanGlow)"
                style={{ animation: 'muscleFibersPulse 2s infinite' }}
              />

              {/* Knee Joints */}
              <circle cx="140" cy="178" r="5" fill="#cbd5e1" />
              <circle cx="160" cy="178" r="5" fill="#cbd5e1" />

              {/* Calves & Shins */}
              <path d="M 138 181 L 136 206 L 144 206 L 143 181 Z" fill="url(#skinGrad)" />
              <path d="M 157 181 L 156 206 L 164 206 L 163 181 Z" fill="url(#skinGrad)" />

              {/* Athletic Lifting Shoes */}
              <path d="M 132 206 L 146 206 L 146 211 L 128 211 Z" fill="#1e293b" />
              <path d="M 154 206 L 168 206 L 172 211 L 154 211 Z" fill="#1e293b" />
            </g>
          )}

          {/* PUSH / BENCH PRESS MOVEMENT PATTERN */}
          {isPress && (
            <g
              transform="translate(0, 10)"
              style={{
                animation: isPlaying ? `humanPressAnim ${animDuration} ease-in-out infinite` : 'none',
                transformOrigin: '150px 140px'
              }}
            >
              {/* Workout Bench Structure */}
              <rect x="50" y="145" width="200" height="12" rx="3" fill="#334155" />
              <rect x="70" y="157" width="10" height="53" fill="#1e293b" />
              <rect x="220" y="157" width="10" height="53" fill="#1e293b" />

              {/* Human Lying on Bench (Side Profile) */}
              {/* Head */}
              <circle cx="85" cy="133" r="14" fill="url(#skinGrad)" />
              {/* Torso lying down */}
              <rect x="98" y="125" width="75" height="20" rx="5" fill="url(#skinGrad)" />

              {/* Chest / Pectoral Active Glow */}
              <path
                d="M 115 125 Q 135 118 150 125 Z"
                fill="url(#muscleGrad)"
                filter="url(#humanGlow)"
                style={{ animation: 'muscleFibersPulse 2s infinite' }}
              />

              {/* Legs bent with feet on ground */}
              <path d="M 172 135 L 205 145 L 208 210" stroke="url(#apparelGrad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <rect x="202" y="206" width="20" height="6" rx="2" fill="#0f172a" />

              {/* Pushing Arms moving up and down */}
              <g>
                {/* Upper arm */}
                <line x1="130" y1="132" x2="135" y2="95" stroke="url(#skinGrad)" strokeWidth="10" strokeLinecap="round" />
                {/* Triceps Highlight */}
                <line x1="128" y1="125" x2="132" y2="100" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
                {/* Forearm */}
                <line x1="135" y1="95" x2="140" y2="60" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />
                {/* Barbell / Dumbbell */}
                <line x1="80" y1="58" x2="200" y2="58" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
                <rect x="72" y="44" width="8" height="28" rx="2" fill="#10b981" />
                <rect x="200" y="44" width="8" height="28" rx="2" fill="#10b981" />
              </g>
            </g>
          )}

          {/* PULL / BENT-OVER ROW PATTERN */}
          {isPull && (
            <g
              transform="translate(15, 0)"
              style={{
                animation: isPlaying ? `humanRowAnim ${animDuration} ease-in-out infinite` : 'none',
                transformOrigin: '150px 140px'
              }}
            >
              {/* Human Torso Hinged at 45 Degrees */}
              <g transform="translate(110, 60)">
                {/* Head */}
                <circle cx="0" cy="0" r="14" fill="url(#skinGrad)" />
                {/* Spine & Latissimus Dorsi */}
                <path d="M 12 6 L 68 45 L 60 65 L 4 25 Z" fill="url(#skinGrad)" />
                {/* Lats Muscular Glow */}
                <path
                  d="M 25 15 L 60 40 L 52 56 L 18 28 Z"
                  fill="url(#muscleGrad)"
                  filter="url(#humanGlow)"
                  style={{ animation: 'muscleFibersPulse 2s infinite' }}
                />

                {/* Pulling Arm with Dumbbell */}
                <line x1="30" y1="20" x2="45" y2="55" stroke="url(#skinGrad)" strokeWidth="9" strokeLinecap="round" />
                <line x1="45" y1="55" x2="52" y2="88" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />
                {/* Dumbbell */}
                <line x1="32" y1="88" x2="72" y2="88" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
                <circle cx="32" cy="88" r="8" fill="#10b981" />
                <circle cx="72" cy="88" r="8" fill="#10b981" />

                {/* Hips & Legs */}
                <path d="M 68 45 L 60 100 L 68 150" stroke="url(#apparelGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {/* Shoe */}
                <rect x="60" y="146" width="22" height="7" rx="2" fill="#0f172a" />
              </g>
            </g>
          )}

          {/* DEADLIFT / POSTERIOR HINGE */}
          {isDeadlift && (
            <g transform="translate(0, 0)">
              {/* Hinged Body */}
              <g
                style={{
                  animation: isPlaying ? `humanDeadliftHinge ${animDuration} ease-in-out infinite` : 'none',
                  transformOrigin: '150px 140px'
                }}
              >
                {/* Head */}
                <circle cx="150" cy="55" r="14" fill="url(#skinGrad)" />
                {/* Torso */}
                <path d="M 140 68 L 160 68 L 158 135 L 142 135 Z" fill="url(#skinGrad)" />
                {/* Glute & Hamstring Glow */}
                <path
                  d="M 140 135 Q 132 170 140 185 Q 152 170 148 135 Z"
                  fill="url(#muscleGrad)"
                  filter="url(#humanGlow)"
                  style={{ animation: 'muscleFibersPulse 2s infinite' }}
                />
                {/* Barbell held in hands */}
                <line x1="85" y1="140" x2="215" y2="140" stroke="#f1f5f9" strokeWidth="5" strokeLinecap="round" />
                <circle cx="90" cy="140" r="12" fill="#10b981" />
                <circle cx="210" cy="140" r="12" fill="#10b981" />
              </g>
              {/* Legs anchored to floor */}
              <path d="M 145 135 L 140 180 L 142 208" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 155 135 L 160 180 L 158 208" stroke="url(#skinGrad)" strokeWidth="12" strokeLinecap="round" fill="none" />
              <rect x="135" y="206" width="18" height="6" rx="2" fill="#0f172a" />
              <rect x="153" y="206" width="18" height="6" rx="2" fill="#0f172a" />
            </g>
          )}

          {/* LUNGE PATTERN */}
          {isLunge && (
            <g
              style={{
                animation: isPlaying ? `humanSquatAnim ${animDuration} ease-in-out infinite` : 'none',
                transformOrigin: '150px 210px'
              }}
            >
              {/* Torso & Head Upright */}
              <circle cx="150" cy="55" r="14" fill="url(#skinGrad)" />
              <rect x="141" y="68" width="18" height="62" rx="4" fill="url(#skinGrad)" />
              {/* Hands holding dumbbells at sides */}
              <line x1="125" y1="95" x2="125" y2="125" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="125" cy="125" r="7" fill="#10b981" />
              <line x1="175" y1="95" x2="175" y2="125" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="175" cy="125" r="7" fill="#10b981" />

              {/* Front Leg at 90 degrees */}
              <path d="M 148 130 L 180 155 L 182 208" stroke="url(#skinGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
              {/* Front Quad Glow */}
              <circle cx="165" cy="142" r="7" fill="url(#muscleGrad)" filter="url(#humanGlow)" />
              {/* Back Leg stepping back */}
              <path d="M 145 130 L 115 165 L 110 208" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />

              {/* Shoes */}
              <rect x="175" y="206" width="18" height="6" rx="2" fill="#0f172a" />
              <rect x="105" y="206" width="18" height="6" rx="2" fill="#0f172a" />
            </g>
          )}

          {/* PLANK PATTERN */}
          {isPlank && (
            <g transform="translate(10, 30)">
              {/* Head */}
              <circle cx="70" cy="130" r="13" fill="url(#skinGrad)" />
              {/* Forearms supporting body on mat */}
              <line x1="72" y1="140" x2="85" y2="175" stroke="url(#skinGrad)" strokeWidth="9" strokeLinecap="round" />
              <line x1="85" y1="175" x2="105" y2="175" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />

              {/* Straight Rigid Torso & Legs in 1 Line */}
              <path d="M 80 135 L 210 155" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" />

              {/* Abdominal Core Stabilization Glow */}
              <rect
                x="110"
                y="135"
                width="45"
                height="14"
                rx="3"
                fill="url(#muscleGrad)"
                filter="url(#humanGlow)"
                style={{ animation: 'corePulseGlow 1.6s ease-in-out infinite' }}
              />

              {/* Feet planted */}
              <circle cx="218" cy="172" r="5" fill="#1e293b" />
              <line x1="210" y1="155" x2="218" y2="172" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />
            </g>
          )}

          {/* FALLBACK GENERAL ATHLETIC STANDING FIGURE */}
          {!isSquat && !isPress && !isPull && !isDeadlift && !isLunge && !isPlank && (
            <g
              style={{
                animation: isPlaying ? `humanSquatAnim ${animDuration} ease-in-out infinite` : 'none',
                transformOrigin: '150px 210px'
              }}
            >
              <circle cx="150" cy="55" r="14" fill="url(#skinGrad)" />
              <rect x="140" y="68" width="20" height="65" rx="5" fill="url(#skinGrad)" />
              {/* Active Deltoids & Biceps */}
              <line x1="140" y1="75" x2="120" y2="105" stroke="url(#skinGrad)" strokeWidth="10" strokeLinecap="round" />
              <line x1="160" y1="75" x2="180" y2="105" stroke="url(#skinGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="120" cy="105" r="6" fill="#10b981" />
              <circle cx="180" cy="105" r="6" fill="#10b981" />
              {/* Legs */}
              <line x1="145" y1="130" x2="140" y2="208" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" />
              <line x1="155" y1="130" x2="160" y2="208" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" />
              <rect x="132" y="206" width="18" height="6" rx="2" fill="#0f172a" />
              <rect x="152" y="206" width="18" height="6" rx="2" fill="#0f172a" />
            </g>
          )}
        </svg>

        {/* Floating Kinetic Muscle Callout */}
        <div className="absolute bottom-3 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Muscle: <strong className="text-emerald-400 font-semibold">{targetedMuscles}</strong></span>
        </div>

        {/* Phase Indicator */}
        <div className="absolute bottom-3 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-400">
          Kinetic Loop · 60 FPS
        </div>
      </div>
    </div>
  );
};
