import React from 'react';
import { Volume2, VolumeX, Music, Pause, Play, Shield } from 'lucide-react';
import { GamePhase } from '../types/game';
import { GameLogo } from './ui/GameLogo';

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

  // Japanese phase translation
  const phaseLabelJapanese =
    phase === 'SPACE'
      ? '深宇宙領域'
      : phase === 'ORBITAL'
      ? '軌道投入'
      : 'テキサス';

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
      {/* Top Streamlined Technical Instrumentation Bar (Mobile-Responsive, No Clipping) */}
      <div className="w-full max-w-5xl mx-auto flex items-start justify-between gap-1 sm:gap-3 pointer-events-auto">
        {/* Left: Compact Propulsion / Cold-Gas PSI Gauge */}
        <div className="flex flex-col bg-black/90 border border-neutral-800 p-1.5 sm:p-2 shadow-2xl w-24 xs:w-32 sm:w-48 shrink-0">
          <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isLowPsi ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="font-oxanium font-bold text-[8px] sm:text-[10px] text-white tracking-wider uppercase">
                PSI
              </span>
            </div>
            <span className={`font-mono text-[9px] sm:text-xs tabular-nums font-bold ${isLowPsi ? 'text-red-400' : 'text-cyan-400'}`}>
              {airPsi}
            </span>
          </div>

          {/* Meter Bar */}
          <div className="w-full h-1.5 sm:h-2 bg-neutral-950 border border-neutral-800 p-0.5">
            <div
              className={`h-full transition-all duration-75 ${
                isLowPsi ? 'bg-red-600' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
              }`}
              style={{ width: `${psiPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-mono text-neutral-500 mt-0.5">
            <span className="hidden xs:inline">[AIR]</span>
            <span className="truncate">{phaseLabelJapanese}</span>
          </div>
        </div>

        {/* Center: "Flippy Roadster" Game Logo & Unified Distance Display (Seamless Single Flow) */}
        <div className="flex flex-col items-center flex-1 min-w-0 max-w-[170px] xs:max-w-[210px] sm:max-w-[280px] mx-1">
          {/* Transparent Floating Game Logo - Responsive sizing, No box container */}
          <img
            src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
            alt="Flippy Roadster"
            className="h-7 xs:h-8 sm:h-14 w-auto object-contain pixelated drop-shadow-[0_0_14px_rgba(232,33,39,0.8)]"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tristanvogt.com')) {
                target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
              }
            }}
          />

          {/* Unified Telemetry Pill (Clean Single Layer) */}
          <div className="flex items-center justify-center gap-1.5 bg-black/90 border border-neutral-800 px-2 py-0.5 sm:px-3 sm:py-1 shadow-2xl mt-0.5 w-full">
            <div className="flex items-baseline gap-1">
              <span className="font-doto font-bold text-lg xs:text-xl sm:text-3xl text-white tracking-tight tabular-nums leading-none">
                {score}
              </span>
              <span className="font-oxanium text-[9px] sm:text-xs text-red-500 font-bold uppercase">
                FT
              </span>
            </div>
            <span className="text-neutral-700 text-[10px]">|</span>
            <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 tabular-nums whitespace-nowrap">
              {Math.round(speedMph)} MPH
            </span>
          </div>
        </div>

        {/* Right: Sharp Minimal Control Buttons (Always 100% visible and accessible on mobile) */}
        <div className="flex items-center gap-1 bg-black/90 border border-neutral-800 p-1 shadow-2xl shrink-0">
          <button
            onClick={onToggleMute}
            className="p-1 sm:p-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-red-900/60 hover:border-red-600/80 transition-all cursor-pointer shadow-[0_0_8px_rgba(232,33,39,0.25)] min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.85)]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.85)]" />
            )}
          </button>

          <button
            onClick={onToggleMusic}
            className="p-1 sm:p-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-red-900/60 hover:border-red-600/80 transition-all cursor-pointer shadow-[0_0_8px_rgba(232,33,39,0.25)] min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isMusicMuted ? 'Start Synthwave Music' : 'Mute Music'}
          >
            <Music
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isMusicMuted
                  ? 'text-red-900/60'
                  : 'text-red-500 drop-shadow-[0_0_8px_rgba(232,33,39,0.9)] animate-pulse'
              }`}
            />
          </button>

          <button
            onClick={onTogglePause}
            className="p-1 sm:p-1.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Tactical Thumb Trigger: BARREL ROLL */}
      <div className="w-full max-w-5xl mx-auto flex items-end justify-between pointer-events-auto pb-1 sm:pb-2">
        {/* Subtle Satirical Engineering Watermark on the left (Desktop only) */}
        <div className="hidden sm:flex flex-col text-[9px] font-mono text-neutral-500 bg-black/70 border border-neutral-900 px-2 py-1">
          <span>SPACEX COLD-GAS SYSTEM v2.4</span>
          <span className="text-neutral-600">ZERO CARBON &middot; 100% UNREGULATED</span>
        </div>

        {/* Sharp Arcade Roll Button (Thumb-optimized for mobile) */}
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
          className={`ml-auto flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 py-2 sm:px-6 sm:py-3.5 border transition-all shadow-2xl cursor-pointer ${
            canRoll
              ? 'bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              : 'bg-black/80 text-neutral-600 border-neutral-900 opacity-50 cursor-not-allowed'
          }`}
          title="Aero Barrel Roll (Invincibility Shield)"
        >
          <Shield className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${canRoll ? 'text-cyan-400 fill-cyan-400/20' : 'text-neutral-600'}`} />
          <div className="flex flex-col text-left">
            <span className="font-oxanium font-bold text-[10px] sm:text-sm tracking-wider uppercase leading-none">
              {isRolling ? 'ROLLING' : 'BARREL ROLL'}
            </span>
            <span className="font-kanji text-[7px] sm:text-[8px] text-cyan-300 font-normal mt-0.5">
              空力ロール (無敵)
            </span>
          </div>
          <span className="hidden sm:inline text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1 py-0.5 border border-neutral-800">
            [B]
          </span>
        </button>
      </div>
    </div>
  );
};
