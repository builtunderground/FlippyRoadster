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
  rollCharge?: number;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onTriggerRoll: () => void;
  onTriggerThrustStart?: () => void;
  onTriggerThrustEnd?: () => void;
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
  onTriggerRoll,
  onTriggerThrustStart,
  onTriggerThrustEnd
}) => {
  const psiPercent = Math.max(0, Math.min(100, (airPsi / maxPsi) * 100));
  const isLowPsi = airPsi < 2000;
  const canRoll = airPsi >= 1800 && !isRolling;

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none select-none flex flex-col justify-between p-2 sm:p-5 overflow-hidden"
      style={{
        paddingTop: 'max(0.4rem, var(--sat))',
        paddingBottom: 'max(0.4rem, var(--sab))',
        paddingLeft: 'max(0.4rem, var(--sal))',
        paddingRight: 'max(0.4rem, var(--sar))'
      }}
    >
      {/* Top Streamlined Technical Instrumentation Bar (Decluttered, sleek layout) */}
      <div className="w-full max-w-5xl mx-auto flex items-start justify-between gap-2 sm:gap-4 pointer-events-auto z-30">
        {/* Left: Compact Cold-Gas PSI Gauge */}
        <div className="flex flex-col bg-black/80 backdrop-blur-sm p-1.5 sm:p-2 w-28 xs:w-36 sm:w-44 shrink-0 border-l border-neutral-700">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLowPsi ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="font-oxanium font-bold text-[9px] sm:text-[10px] text-white tracking-wider uppercase">
                PSI
              </span>
            </div>
            <span className={`font-mono text-[9px] sm:text-xs tabular-nums font-bold ${isLowPsi ? 'text-red-400' : 'text-cyan-400'}`}>
              {airPsi.toString().padStart(5, ' ')}
            </span>
          </div>

          {/* Meter Bar */}
          <div className="w-full h-1.5 sm:h-2 bg-neutral-900 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                isLowPsi ? 'bg-red-600' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
              }`}
              style={{ width: `${psiPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Floating Game Logo + Distance & Speed Telemetry Box */}
        <div className="flex flex-col items-center shrink-0">
          {/* Floating Game Logo */}
          <img
            src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
            alt="Flippy Roadster"
            className="h-9 xs:h-11 sm:h-16 md:h-20 w-auto object-contain pixelated drop-shadow-[0_0_18px_rgba(232,33,39,0.85)] mb-1 pointer-events-none"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tristanvogt.com')) {
                target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
              }
            }}
          />

          {/* Clean Distance & Speed */}
          <div className="flex items-center justify-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-1">
            <div className="flex items-baseline gap-1">
              <span className="font-doto font-bold text-base xs:text-lg sm:text-2xl text-white tracking-tight tabular-nums leading-none">
                {score.toLocaleString()}
              </span>
              <span className="font-oxanium text-[8px] sm:text-xs text-red-500 font-bold uppercase">
                FT
              </span>
            </div>
            <span className="text-neutral-600 text-xs">&middot;</span>
            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 tabular-nums whitespace-nowrap">
              {Math.round(speedMph)} MPH
            </span>
          </div>
        </div>

        {/* Right: Sound & Music Controls (Clean Icons) */}
        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm p-1 shrink-0">
          {/* Sound Icon Button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 hover:bg-neutral-850 text-red-500 transition-colors cursor-pointer min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.8)]" />
            )}
          </button>

          {/* Music Icon Note */}
          <button
            onClick={onToggleMusic}
            className="p-1.5 hover:bg-neutral-850 transition-colors cursor-pointer min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isMusicMuted ? 'Play Music' : 'Mute Music'}
          >
            <Music
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isMusicMuted ? 'text-neutral-600' : 'text-red-500 drop-shadow-[0_0_8px_rgba(232,33,39,0.8)]'
              }`}
            />
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            className="p-1.5 hover:bg-neutral-850 text-neutral-300 hover:text-white transition-colors cursor-pointer min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300" />}
          </button>
        </div>
      </div>

      {/* Bottom Tactical Controls: Clean, Tactile, High-Contrast */}
      <div className="w-full max-w-5xl mx-auto flex items-end justify-between pointer-events-auto pb-1 sm:pb-2 gap-2 z-30">
        {/* Left: THRUST (Vertical Lift) Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch {}
            onTriggerThrustStart?.();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {}
            onTriggerThrustEnd?.();
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTriggerThrustEnd?.();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 border border-red-400 text-white shadow-[0_0_20px_rgba(232,33,39,0.4)] cursor-pointer select-none transition-all touch-manipulation min-h-[46px] sm:min-h-[52px] active:scale-95"
          title="Vertical Thrust: pushes roadster upward (Tap or Hold)"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          <span className="font-oxanium font-bold text-xs sm:text-sm tracking-wider uppercase">
            THRUST
          </span>
          <span className="hidden sm:inline text-[9px] font-mono text-red-100 bg-red-800 px-1 py-0.5">
            SPACE
          </span>
        </button>

        {/* Center Tip */}
        <div className="hidden sm:flex text-[9px] font-mono text-neutral-400 bg-black/80 border border-neutral-800 px-3 py-1 pointer-events-none">
          <span>THRUST [SPACE] &middot; BARREL ROLL [B]</span>
        </div>

        {/* Right: BARREL ROLL Button */}
        <button
          type="button"
          disabled={!canRoll}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canRoll) onTriggerRoll();
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 border transition-all cursor-pointer select-none touch-manipulation min-h-[46px] sm:min-h-[52px] active:scale-95 ${
            canRoll
              ? 'bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-white border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.35)]'
              : 'bg-black/60 text-neutral-600 border-neutral-900 opacity-50 cursor-not-allowed'
          }`}
          title="Barrel Roll: 360° Spin & Shield (-1800 PSI)"
        >
          <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${canRoll ? 'text-cyan-400' : 'text-neutral-600'}`} />
          <span className="font-oxanium font-bold text-xs sm:text-sm tracking-wider uppercase">
            {isRolling ? 'ROLLING' : 'BARREL ROLL'}
          </span>
          <span className="hidden sm:inline text-[9px] font-mono text-cyan-400 bg-neutral-900 px-1 py-0.5 border border-cyan-800/50">
            B
          </span>
        </button>
      </div>
    </div>
  );
};
