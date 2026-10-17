import React from 'react';
import { Volume2, VolumeX, Music, Pause, Play, ShieldAlert } from 'lucide-react';
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
  rollCharge: number; // 0 to 1
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
  rollCharge,
  onTogglePause,
  onToggleMute,
  onToggleMusic,
  onTriggerRoll
}) => {
  const psiPercent = Math.max(0, Math.min(100, (airPsi / maxPsi) * 100));
  const isLowPsi = airPsi < 2000;

  const phaseNames: Record<GamePhase, string> = {
    WACO: 'WACO STAGING',
    ORBITAL: 'CYBER COMPLEX',
    SPACE: 'STARBASE CITY'
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 select-none p-2 sm:p-4 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 bg-black/75 backdrop-blur-md border border-cyan-500/30 px-3 sm:px-6 py-2.5 rounded-lg shadow-2xl pointer-events-auto">
        {/* Brand Zone: Tesla Emblem & Pixel Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
            alt="Flippy Roadster"
            className="h-6 sm:h-8 w-auto object-contain pixelated"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tristanvogt.com')) {
                target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
              }
            }}
          />
          <span className="text-[9px] font-mono text-cyan-400 tracking-widest hidden sm:inline border-l border-slate-700 pl-2">
            {phaseNames[phase]}
          </span>
        </div>

        {/* Center Zone: AIR PSI Gauge */}
        <div className="flex flex-col items-center gap-1 min-w-[120px] sm:min-w-[190px]">
          <div className="flex items-center justify-between w-full text-[10px] sm:text-xs font-mono font-bold">
            <span className={isLowPsi ? 'text-red-400 animate-pulse' : 'text-cyan-300'}>
              AIR PSI
            </span>
            <span className="text-slate-300 tabular-nums">
              {Math.round(airPsi).toLocaleString()} / {maxPsi.toLocaleString()}
            </span>
          </div>

          {/* Segmented bar meter */}
          <div className="w-full h-3 sm:h-3.5 bg-slate-900 border border-cyan-500/50 p-0.5 rounded-sm relative overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                isLowPsi
                  ? 'bg-gradient-to-r from-red-600 to-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-300'
              }`}
              style={{ width: `${psiPercent}%` }}
            />
            {/* Pressure segment ticks */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-40">
              <div className="w-px h-full bg-black" />
              <div className="w-px h-full bg-black" />
              <div className="w-px h-full bg-black" />
            </div>
          </div>
        </div>

        {/* Score: FEET CLEARED */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <span className="font-pixel text-base sm:text-2xl text-white tracking-widest tabular-nums font-bold">
            {score}
          </span>
          <span className="text-[9px] font-retro text-cyan-400 uppercase tracking-wider">
            Feet Cleared
          </span>
        </div>

        {/* SPEED MPH Readout */}
        <div className="hidden md:flex flex-col items-end justify-center shrink-0 min-w-[70px]">
          <div className="flex items-baseline gap-1">
            <span className="font-hud font-extrabold text-lg sm:text-xl text-cyan-300 tabular-nums">
              {Math.round(speedMph)}
            </span>
            <span className="text-[10px] font-mono text-slate-400">MPH</span>
          </div>
          <span className="text-[9px] font-retro text-slate-400">THRUST SPEED</span>
        </div>

        {/* Right Zone: Controls (Roll button for mobile/touch, audio, pause) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Mobile / Desktop Barrel Roll Trigger */}
          <button
            onClick={onTriggerRoll}
            disabled={airPsi < 1800 || isRolling}
            title="Perform 360° Barrel Roll (1,800 PSI · Press [B] or [SHIFT])"
            className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded text-[10px] font-pixel border transition-all flex items-center gap-1 ${
              airPsi >= 1800 && !isRolling
                ? 'bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)] cursor-pointer'
                : 'bg-slate-900/60 text-slate-600 border-slate-800 cursor-not-allowed opacity-60'
            }`}
          >
            <span>{isRolling ? 'ROLLING' : 'ROLL'}</span>
            <span className="hidden sm:inline text-[8px] opacity-75 font-mono bg-cyan-900/60 px-1 py-0.2 rounded border border-cyan-700/50">[B]</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Synthwave Music Toggle */}
          <button
            onClick={onToggleMusic}
            className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isMusicMuted ? 'Play Synthwave Music' : 'Stop Synthwave Music'}
          >
            <Music className={`w-4 h-4 ${isMusicMuted ? 'text-slate-500' : 'text-purple-400'}`} />
          </button>

          {/* Pause Toggle */}
          <button
            onClick={onTogglePause}
            className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-cyan-300" />}
          </button>
        </div>
      </div>

      {/* Low PSI Warning Indicator if under 2000 */}
      {isLowPsi && (
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-mono text-red-400 bg-red-950/80 border border-red-500/50 py-0.5 px-3 rounded w-fit mx-auto animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>WARNING: LOW COLD-GAS PRESSURE — COAST TO REPLENISH</span>
        </div>
      )}
    </header>
  );
};
