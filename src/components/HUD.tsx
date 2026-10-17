import React from 'react';
import { Volume2, VolumeX, Music, Pause, Play, Shield } from 'lucide-react';
import { GamePhase } from '../types/game';

interface HUDProps {
  score: number;
  airPsi: number;
  maxPsi: number;
  speedMph: number;
  phase: GamePhase;
  isPaused: boolean;
  isMuted: boolean;
  isMusicMuted: boolean;
  isRolling: boolean;
  rollCharge: number;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onTriggerRoll: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  airPsi,
  maxPsi,
  speedMph,
  phase,
  isPaused,
  isMuted,
  isMusicMuted,
  isRolling,
  onTogglePause,
  onToggleMute,
  onToggleMusic,
  onTriggerRoll
}) => {
  const psiPercent = Math.max(0, Math.min(100, (airPsi / maxPsi) * 100));
  const isLowPsi = airPsi < 2000;
  const canRoll = airPsi >= 1800 && !isRolling;

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5"
      style={{
        paddingTop: 'max(0.75rem, var(--sat))',
        paddingBottom: 'max(0.75rem, var(--sab))',
        paddingLeft: 'max(0.75rem, var(--sal))',
        paddingRight: 'max(0.75rem, var(--sar))'
      }}
    >
      {/* Top Streamlined Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Minimal Cold-Gas Boost / PSI Meter */}
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-lg shadow-lg">
          <span className={`text-[10px] font-mono font-bold ${isLowPsi ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
            BOOST
          </span>
          <div className="w-20 sm:w-28 h-2.5 bg-slate-900 border border-cyan-500/50 rounded-sm overflow-hidden p-0.5">
            <div
              className={`h-full transition-all duration-75 ${
                isLowPsi
                  ? 'bg-gradient-to-r from-red-600 to-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 to-sky-300'
              }`}
              style={{ width: `${psiPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Distance in Feet */}
        <div className="flex flex-col items-center bg-black/75 backdrop-blur-md border border-cyan-500/40 px-4 py-1.5 rounded-lg shadow-lg">
          <div className="font-pixel text-lg sm:text-2xl text-white tracking-widest tabular-nums font-bold">
            {score} <span className="text-xs sm:text-sm text-cyan-400">FT</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Sound, Music, Pause) */}
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-cyan-500/40 p-1.5 rounded-lg shadow-lg">
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={onToggleMusic}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMusicMuted ? 'Start Music' : 'Stop Music'}
          >
            <Music className={`w-4 h-4 ${isMusicMuted ? 'text-slate-500' : 'text-purple-400'}`} />
          </button>

          <button
            onClick={onTogglePause}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-cyan-300" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Mobile Thumb Trigger: BARREL ROLL */}
      <div className="w-full max-w-4xl mx-auto flex items-end justify-end pointer-events-auto pb-1 sm:pb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTriggerRoll();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onTriggerRoll();
          }}
          disabled={!canRoll}
          className={`flex items-center justify-center gap-2 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-pixel text-xs sm:text-sm tracking-wider border-2 transition-all shadow-2xl cursor-pointer ${
            canRoll
              ? 'bg-cyan-950/90 hover:bg-cyan-900 active:scale-90 text-cyan-200 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse'
              : 'bg-slate-950/70 text-slate-600 border-slate-800 opacity-60 cursor-not-allowed'
          }`}
          title="360° Barrel Roll (Invincibility Shield)"
        >
          <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${canRoll ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-600'}`} />
          <span>{isRolling ? 'ROLLING' : 'ROLL'}</span>
          <span className="hidden sm:inline text-[9px] font-mono text-cyan-400/80 bg-cyan-900/60 px-1 py-0.5 rounded border border-cyan-700/60">[B]</span>
        </button>
      </div>
    </div>
  );
};
