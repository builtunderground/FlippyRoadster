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
      ? '軌道投入フェーズ'
      : 'テキサス射場';

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5"
      style={{
        paddingTop: 'max(0.6rem, var(--sat))',
        paddingBottom: 'max(0.6rem, var(--sab))',
        paddingLeft: 'max(0.6rem, var(--sal))',
        paddingRight: 'max(0.6rem, var(--sar))'
      }}
    >
      {/* Top Streamlined Technical Instrumentation Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-start justify-between gap-3 pointer-events-auto">
        {/* Left: Compact Boost / Cold-Gas PSI Gauge (Wider fixed width to prevent dynamic shifting) */}
        <div className="flex flex-col bg-black/90 border border-neutral-800 p-2 sm:px-3 sm:py-2 shadow-2xl relative w-44 sm:w-56 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 ${isLowPsi ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="font-oxanium font-bold text-[10px] text-white tracking-widest uppercase">
                PROPULSION
              </span>
              <span className="font-kanji text-[9px] text-neutral-400 hidden xs:inline">推進力</span>
            </div>
            <span className={`font-mono text-[9px] tabular-nums font-bold shrink-0 ${isLowPsi ? 'text-red-400' : 'text-cyan-400'}`}>
              {airPsi} PSI
            </span>
          </div>

          {/* Sharp Rectangular Meter Bar */}
          <div className="w-full h-2 bg-neutral-950 border border-neutral-800 p-0.5">
            <div
              className={`h-full transition-all duration-75 ${
                isLowPsi ? 'bg-red-600' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
              }`}
              style={{ width: `${psiPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500 mt-1">
            <span>[COMP-AIR]</span>
            <span className="truncate">{phaseLabelJapanese}</span>
          </div>
        </div>

        {/* Center: "Flippy Roadster" Game Logo (Visible Always, Doubled Size) & Altitude Display */}
        <div className="flex flex-col items-center gap-1 w-48 sm:w-64 shrink-0">
          <GameLogo size="md" showSubtitle={false} className="drop-shadow-[0_0_18px_rgba(232,33,39,0.85)]" />

          <div className="w-full flex flex-col items-center bg-black/90 border border-neutral-800 px-3 py-1 sm:px-6 sm:py-1.5 shadow-2xl">
            <div className="text-[9px] font-kanji text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-1.5 w-full">
              <span>標高・距離</span>
              <span className="font-mono text-neutral-500">[ALTITUDE]</span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5 my-0.5">
              <span className="font-doto font-bold text-2xl sm:text-4xl text-white tracking-tight tabular-nums leading-none">
                {score}
              </span>
              <span className="font-oxanium text-xs sm:text-sm text-red-500 font-bold uppercase tracking-wider">
                FT
              </span>
            </div>
            <div className="text-[8px] font-mono text-neutral-500 tabular-nums text-center whitespace-nowrap">
              {Math.round(speedMph)} MPH &middot; MACH {(speedMph / 767).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Right: Sharp Minimal Control Buttons */}
        <div className="flex items-center gap-1 bg-black/90 border border-neutral-800 p-1 shadow-2xl shrink-0">
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-red-900/60 hover:border-red-600/80 transition-all cursor-pointer shadow-[0_0_8px_rgba(232,33,39,0.25)]"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.85)]" />
            ) : (
              <Volume2 className="w-4 h-4 text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.85)]" />
            )}
          </button>

          <button
            onClick={onToggleMusic}
            className="p-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-red-900/60 hover:border-red-600/80 transition-all cursor-pointer shadow-[0_0_8px_rgba(232,33,39,0.25)]"
            title={isMusicMuted ? 'Start Synthwave Music' : 'Mute Music'}
          >
            <Music
              className={`w-4 h-4 ${
                isMusicMuted
                  ? 'text-red-900/60'
                  : 'text-red-500 drop-shadow-[0_0_8px_rgba(232,33,39,0.9)] animate-pulse'
              }`}
            />
          </button>

          <button
            onClick={onTogglePause}
            className="p-1.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-neutral-300" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Tactical Thumb Trigger: BARREL ROLL */}
      <div className="w-full max-w-5xl mx-auto flex items-end justify-between pointer-events-auto pb-1 sm:pb-2">
        {/* Subtle Satirical Engineering Watermark on the left */}
        <div className="hidden sm:flex flex-col text-[9px] font-mono text-neutral-500 bg-black/70 border border-neutral-900 px-2 py-1">
          <span>SPACEX COLD-GAS SYSTEM v2.4</span>
          <span className="text-neutral-600">ZERO CARBON &middot; 100% UNREGULATED</span>
        </div>

        {/* Sharp Arcade Roll Button */}
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
          className={`flex items-center justify-center gap-2.5 px-5 py-3 sm:px-6 sm:py-3.5 border transition-all shadow-2xl cursor-pointer ${
            canRoll
              ? 'bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              : 'bg-black/80 text-neutral-600 border-neutral-900 opacity-50 cursor-not-allowed'
          }`}
          title="Aero Barrel Roll (Invincibility Shield)"
        >
          <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${canRoll ? 'text-cyan-400 fill-cyan-400/20' : 'text-neutral-600'}`} />
          <div className="flex flex-col text-left">
            <span className="font-oxanium font-bold text-xs sm:text-sm tracking-wider uppercase leading-none">
              {isRolling ? 'ROLLING' : 'BARREL ROLL'}
            </span>
            <span className="font-kanji text-[8px] text-cyan-300 font-normal mt-0.5">
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
