import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Plus, Bell, Volume2, VolumeX } from 'lucide-react';

interface RestTimerModalProps {
  initialSeconds: number;
  exerciseName?: string;
  onClose: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  initialSeconds,
  exerciseName,
  onClose
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds || 60);
  const [remaining, setRemaining] = useState(initialSeconds || 60);
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthetic tone using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // AudioContext unavailable
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  const toggleRun = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
  };

  const addTime = (secs: number) => {
    setRemaining((prev) => prev + secs);
    setTotalSeconds((prev) => Math.max(prev, remaining + secs));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-5 w-80 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${remaining === 0 ? 'bg-amber-400' : isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Rest Interval
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              title={soundEnabled ? 'Mute chime' : 'Enable chime'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {exerciseName && (
          <p className="text-xs text-slate-400 mt-2 truncate">
            Resting after: <span className="text-white font-medium">{exerciseName}</span>
          </p>
        )}

        {/* Big Timer Display */}
        <div className="my-4 text-center">
          <div className="font-mono text-5xl font-extrabold tracking-tight tabular-nums text-white">
            {formatTime(remaining)}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${remaining === 0 ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Quick adjustments */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => addTime(15)}
            className="px-2.5 py-1 text-[11px] font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
          >
            +15s
          </button>
          <button
            onClick={() => addTime(30)}
            className="px-2.5 py-1 text-[11px] font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
          >
            +30s
          </button>
          <button
            onClick={() => {
              setTotalSeconds(60);
              setRemaining(60);
              setIsRunning(true);
            }}
            className="px-2.5 py-1 text-[11px] font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
          >
            60s
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={resetTimer}
            className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={toggleRun}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
