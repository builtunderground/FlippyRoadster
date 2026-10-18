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
  onTriggerThrust?: () => void;
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
  onTriggerThrust
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
      {/* Top Streamlined Technical Instrumentation Bar (Wide stable boxes, No horizontal shifts) */}
      <div className="w-full max-w-5xl mx-auto flex items-start justify-between gap-1.5 sm:gap-4 pointer-events-auto z-30">
        {/* Left: Compact Propulsion / Cold-Gas PSI Gauge (Wider, rock-solid width so no shifting) */}
        <div className="flex flex-col bg-black/95 border border-neutral-800 p-1.5 sm:p-2 shadow-2xl w-28 xs:w-36 sm:w-52 shrink-0">
          <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isLowPsi ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="font-oxanium font-bold text-[8px] sm:text-[10px] text-white tracking-wider uppercase">
                PSI
              </span>
            </div>
            <span className={`font-mono text-[9px] sm:text-xs tabular-nums font-bold ${isLowPsi ? 'text-red-400' : 'text-cyan-400'}`}>
              {airPsi.toString().padStart(5, ' ')}
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
            <span className="hidden xs:inline">[COLD-GAS]</span>
            <span className="truncate">{phaseLabelJapanese}</span>
          </div>
        </div>

        {/* Center: Floating Game Logo + Distance & Speed Telemetry Box (Stacked vertically in flex flow - ZERO overlap) */}
        <div className="flex flex-col items-center shrink-0">
          {/* Floating Game Logo - Responsive doubled size, No box container */}
          <img
            src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
            alt="Flippy Roadster"
            className="h-9 xs:h-11 sm:h-16 md:h-20 w-auto object-contain pixelated drop-shadow-[0_0_18px_rgba(232,33,39,0.9)] mb-1 pointer-events-none"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tristanvogt.com')) {
                target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
              }
            }}
          />

          {/* Unified Score Telemetry Box (Wide, stable, fixed width) */}
          <div className="flex items-center justify-center gap-1.5 bg-black/95 border border-neutral-800 px-2.5 py-0.5 sm:px-3 sm:py-1 shadow-2xl w-32 xs:w-40 sm:w-52">
            <div className="flex items-baseline gap-1">
              <span className="font-doto font-bold text-base xs:text-lg sm:text-2xl text-white tracking-tight tabular-nums leading-none">
                {score}
              </span>
              <span className="font-oxanium text-[8px] sm:text-xs text-red-500 font-bold uppercase">
                FT
              </span>
            </div>
            <span className="text-neutral-700 text-[10px]">|</span>
            <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 tabular-nums whitespace-nowrap">
              {Math.round(speedMph)} MPH
            </span>
          </div>
        </div>

        {/* Right: Sharp Minimal Control Buttons (Red sound & music icons, high contrast) */}
        <div className="flex items-center gap-1 bg-black/95 border border-neutral-800 p-1 shadow-2xl shrink-0">
          {/* Sound Icon Button (RED) */}
          <button
            onClick={onToggleMute}
            className="p-1 sm:p-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-red-900/80 hover:border-red-600 transition-all cursor-pointer shadow-[0_0_8px_rgba(232,33,39,0.3)] min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.9)]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.9)]" />
            )}
          </button>

          {/* Music Icon Note (RED) */}
          <button
            onClick={onToggleMusic}
            className="p-1 sm:p-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-red-900/80 hover:border-red-600 transition-all cursor-pointer shadow-[0_0_8px_rgba(232,33,39,0.3)] min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isMusicMuted ? 'Start Synthwave Music' : 'Mute Music'}
          >
            <Music
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isMusicMuted
                  ? 'text-red-700/70'
                  : 'text-red-500 drop-shadow-[0_0_8px_rgba(232,33,39,0.9)] animate-pulse'
              }`}
            />
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            className="p-1 sm:p-1.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Tactical Mobile Controls: THRUST (Vertical Lift) vs BARREL ROLL (360° Shield & Boost) */}
      <div className="w-full max-w-5xl mx-auto flex items-end justify-between pointer-events-auto pb-1 sm:pb-2 gap-2 z-30">
        {/* Left: Tactical Cold-Gas Vertical LIFT / THRUST Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTriggerThrust?.();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onTriggerThrust?.();
          }}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 border border-red-400 text-white shadow-[0_0_22px_rgba(232,33,39,0.5)] cursor-pointer select-none transition-all touch-manipulation min-h-[46px] sm:min-h-[52px]"
          title="Cold-Gas Vertical Lift: pushes roadster upward (Tap or Hold)"
        >
          <div className="w-2.5 h-2.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] animate-ping" />
          <div className="flex flex-col text-left">
            <span className="font-oxanium font-bold text-xs sm:text-sm tracking-wider uppercase leading-none">
              THRUST
            </span>
            <span className="font-kanji text-[7px] sm:text-[8px] text-red-200 mt-0.5">
              垂直上昇 [TAP / HOLD]
            </span>
          </div>
          <span className="hidden sm:inline text-[9px] font-mono text-white/80 bg-red-800/80 px-1 py-0.5 border border-red-400/50">
            [SPACE]
          </span>
        </button>

        {/* Center: Tactical Screen Tip */}
        <div className="hidden xs:flex flex-col items-center text-center text-[8px] sm:text-[9px] font-mono text-neutral-400 bg-black/85 border border-neutral-900 px-2.5 py-1 shadow-lg pointer-events-none">
          <span>[TAP / HOLD] = VERTICAL LIFT &middot; [BARREL ROLL / B] = 360&deg; SHIELD BOOST</span>
          <span className="font-kanji text-neutral-500 text-[7px]">タップ/長押しで上昇 · 回避ボタンで360度シールド突進</span>
        </div>

        {/* Right: Sharp Arcade BARREL ROLL (360° Acrobatic Spin & Deflector Shield) Button */}
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
          className={`flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 py-2.5 sm:px-5 sm:py-3 border transition-all shadow-2xl cursor-pointer select-none touch-manipulation min-h-[46px] sm:min-h-[52px] ${
            canRoll
              ? 'bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              : 'bg-black/80 text-neutral-600 border-neutral-900 opacity-50 cursor-not-allowed'
          }`}
          title="Acrobatic 360° Barrel Roll: +180 MPH surge and cyan deflector shield against obstacles (-1800 PSI)"
        >
          <Shield className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${canRoll ? 'text-cyan-400 fill-cyan-400/20' : 'text-neutral-600'}`} />
          <div className="flex flex-col text-left">
            <span className="font-oxanium font-bold text-[10px] sm:text-sm tracking-wider uppercase leading-none">
              {isRolling ? 'ROLLING' : 'BARREL ROLL'}
            </span>
            <span className="font-kanji text-[7px] sm:text-[8px] text-cyan-300 font-normal mt-0.5">
              360&deg; 無敵シールド
            </span>
          </div>
          <span className="hidden sm:inline text-[9px] font-mono text-cyan-400/90 bg-neutral-900 px-1 py-0.5 border border-cyan-800/60">
            [B] -1800
          </span>
        </button>
      </div>
    </div>
  );
};
