import React from 'react';
import { RotateCcw, Menu, Trophy, AlertTriangle } from 'lucide-react';
import { Skin } from '../types/game';
import { GameLogo } from './ui/GameLogo';
import { OptimusBot } from './ui/OptimusBot';
import { ShantiisanFooter } from './ui/ShantiisanFooter';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  maxSpeed: number;
  barrelRolls: number;
  currentSkin: Skin;
  quote: string;
  onRestart: () => void;
  onOpenGarage?: () => void;
  onOpenLeaderboard?: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  quote,
  onRestart,
  onOpenLeaderboard,
  onMainMenu
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm select-none touch-none overflow-y-auto">
      <div className="bg-[#050505] border border-red-600/60 max-w-md w-full p-4 sm:p-6 shadow-[0_0_80px_rgba(232,33,39,0.35)] text-center flex flex-col items-center relative my-auto">
        {/* Technical Corner Registration Marks */}
        <div className="absolute top-1 left-1 font-mono text-[9px] text-red-600/70">⌜ SYS-ERR ⌝</div>
        <div className="absolute top-1 right-1 font-mono text-[9px] text-red-600/70">⌞ SEC-04 ⌟</div>

        {/* Flippy Roadster Game Logo prominently featured on Mission Abort Screen (Doubled Size) */}
        <div className="mb-2 pt-1 flex justify-center w-full">
          <GameLogo size="lg" showSubtitle={false} className="drop-shadow-[0_0_32px_rgba(232,33,39,0.85)]" />
        </div>

        {/* Failed Product Demonstration Header */}
        <div className="flex items-center gap-2 text-red-600 drop-shadow-[0_0_12px_rgba(232,33,39,0.8)] mb-0.5">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          <h2 className="font-oxanium font-bold text-2xl sm:text-3xl tracking-wider uppercase">
            MISSION ABORT
          </h2>
        </div>

        {/* Japanese Failure Annotation */}
        <div className="flex items-center gap-2 text-[10px] font-kanji text-red-400/90 tracking-widest uppercase mb-2">
          <span>飛行中止シーケンス発令</span>
          <span className="font-mono text-neutral-500">[ANOMALY DETECTED]</span>
        </div>

        {/* Optimus diagnostics status */}
        <div className="w-full my-1.5">
          <OptimusBot
            mood="alert"
            statusMessage="ANOMALY LOGGED. DEBRIS RETRIEVAL TEAMS DISPATCHED."
            subMessage="OPTIMUS GEN-2 // MISSION DIAGNOSTICS"
            size="sm"
            compact={true}
          />
        </div>

        {/* Deadpan Technical Corporate Quote */}
        <div className="w-full bg-neutral-950 border-l-2 border-red-600 border-y border-r border-neutral-800 p-2.5 my-1.5 text-xs font-mono text-neutral-300 italic text-left">
          &ldquo;{quote}&rdquo;
          <div className="text-[9px] text-neutral-500 not-italic mt-1 font-mono">
            &mdash; TSLA STARBASE MISSION TELEMETRY LOG
          </div>
        </div>

        {/* Telemetry Display with Oversized Doto Numbers */}
        <div className="w-full bg-black border border-neutral-800 p-3.5 my-2 flex flex-col items-center">
          <div className="text-[9px] font-kanji text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span>到達高度計測値</span>
            <span className="font-mono text-neutral-500">DISTANCE CLEARED</span>
          </div>

          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="font-doto text-4xl sm:text-5xl text-white font-bold tracking-tight tabular-nums leading-none">
              {score}
            </span>
            <span className="font-oxanium text-base text-red-500 font-bold uppercase tracking-wider">
              FT
            </span>
          </div>

          {isNewHigh ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-400 text-amber-300 font-oxanium font-bold text-xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW RECORD ESTABLISHED</span>
              <span className="font-kanji text-[9px] text-amber-400">最高記録更新</span>
            </div>
          ) : (
            <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
              <span>BENCHMARK:</span>
              <span className="text-white font-bold font-oxanium">{highScore} FT</span>
            </div>
          )}
        </div>

        {/* Satirical Corporate Failure Assessment */}
        <div className="text-[9px] font-mono text-neutral-500 mb-3 w-full text-center">
          EST. DAMAGE: PROTOTYPE HARDWARE CONSUMABLE &middot; RESERVATION QUEUE: #14,291
        </div>

        {/* Action Buttons: Sharp Rectangular Arcade Controls */}
        <div className="flex flex-col gap-2 w-full font-oxanium font-bold text-xs sm:text-sm">
          {/* RETRY BUTTON */}
          <button
            onClick={onRestart}
            className="flex items-center justify-between w-full py-3 px-5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border border-red-400 shadow-[0_0_24px_rgba(232,33,39,0.45)] cursor-pointer transition-all tracking-wider"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>RETRY MISSION</span>
              <span className="font-kanji text-[10px] text-red-200">再始動</span>
            </div>
            <span className="text-[10px] font-mono text-red-200 font-normal">[TAP OR SPACE]</span>
          </button>

          {/* ARCADE LEADERBOARD / INITIALS BUTTON */}
          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="flex items-center justify-between w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer transition-all tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>ARCADE HIGH SCORES</span>
                <span className="font-kanji text-[10px] text-amber-400/80">3文字登録</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-neutral-900 px-1.5 py-0.5 border border-neutral-800">
                [ENTER INITIALS]
              </span>
            </button>
          )}

          {/* MAIN MENU BUTTON */}
          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-2.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition-colors tracking-wider"
          >
            <Menu className="w-4 h-4" />
            <span>MAIN MENU</span>
            <span className="font-kanji text-[10px] text-neutral-500">メニューへ戻る</span>
          </button>
        </div>

        {/* Footer with Shantiisan Official Copyright */}
        <div className="w-full mt-3 pt-2.5 border-t border-neutral-900">
          <ShantiisanFooter />
        </div>
      </div>
    </div>
  );
};
