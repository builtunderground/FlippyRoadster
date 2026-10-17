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
        <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg shadow-xl">
          <span className={`text-[9px] font-label font-bold tracking-wider ${isLowPsi ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
            BOOST
          </span>
          <div className="w-20 sm:w-28 h-2.5 bg-black/90 border border-white/15 rounded-sm overflow-hidden p-0.5">
            <div
              className={`h-full transition-all duration-75 ${
                isLowPsi
                  ? 'bg-red-600'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${psiPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Distance in Feet (White informational text, Pixelify Sans) */}
        <div className="flex flex-col items-center bg-black/85 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-lg shadow-xl">
          <div className="font-display text-2xl sm:text-3xl text-white tracking-wider tabular-nums font-bold leading-none">
            {score} <span className="font-label text-xs sm:text-sm text-slate-400 font-normal">FT</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Sound, Music, Pause) */}
        <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md border border-white/10 p-1.5 rounded-lg shadow-xl">
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          <button
            onClick={onToggleMusic}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMusicMuted ? 'Start Music' : 'Stop Music'}
          >
            <Music className={`w-4 h-4 ${isMusicMuted ? 'text-slate-600' : 'text-purple-400'}`} />
          </button>

          <button
            onClick={onTogglePause}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
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
          className={`flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-tech text-xs sm:text-sm tracking-wider border transition-all shadow-xl cursor-pointer ${
            canRoll
              ? 'bg-slate-950/90 hover:bg-slate-900 active:scale-95 text-white border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse'
              : 'bg-black/60 text-slate-600 border-white/5 opacity-50 cursor-not-allowed'
          }`}
          title="360° Barrel Roll (Invincibility Shield)"
        >
          <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${canRoll ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-600'}`} />
          <span className="font-bold">{isRolling ? 'ROLLING' : 'ROLL'}</span>
          <span className="hidden sm:inline text-[10px] font-mono text-slate-400 bg-white/5 px-1 py-0.5 rounded border border-white/10">[B]</span>
        </button>
      </div>
    </div>
  );
};
