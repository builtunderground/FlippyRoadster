import React from 'react';
import { RotateCcw, Menu, Trophy } from 'lucide-react';
import { Skin } from '../types/game';

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
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  quote,
  onRestart,
  onMainMenu
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none touch-none">
      <div className="bg-[#05070E] border border-red-600/50 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-[0_0_60px_rgba(232,33,39,0.3)] text-center flex flex-col items-center">
        {/* Failed Product Demonstration Header */}
        <div className="font-display font-bold text-2xl sm:text-3xl text-red-600 tracking-wider mb-0.5 drop-shadow-[0_0_15px_rgba(232,33,39,0.7)]">
          MISSION ABORT
        </div>

        <div className="font-mono text-[10px] text-red-400/80 uppercase tracking-widest mb-3">
          TEST RUN ANOMALY DETECTED
        </div>

        {/* Deadpan technical quote */}
        <div className="w-full bg-black/80 border-l-2 border-red-600 border-y border-r border-white/5 rounded-r-lg p-3 my-2 text-xs font-mono text-slate-300 italic text-left">
          "{quote}"
        </div>

        {/* Telemetry Display */}
        <div className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl p-4 my-3">
          <div className="text-[10px] font-label text-slate-400 uppercase tracking-widest mb-1">
            DISTANCE CLEARED
          </div>
          <div className="font-display text-4xl sm:text-5xl text-white font-bold tracking-tight mb-2 tabular-nums">
            {score} <span className="font-label text-base text-slate-400 font-normal">FT</span>
          </div>

          {isNewHigh ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-400/60 rounded-full text-amber-300 font-tech font-bold text-xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW RECORD</span>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-400">
              BENCHMARK: <span className="text-white font-bold">{highScore} FT</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Chakra Petch Bold */}
        <div className="flex flex-col gap-2.5 w-full font-tech font-bold text-xs sm:text-sm">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl border border-red-400 shadow-[0_0_20px_rgba(232,33,39,0.45)] cursor-pointer transition-all tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY</span>
            <span className="text-[10px] font-mono text-red-200/80 font-normal">[TAP OR SPACE]</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white rounded-xl border border-white/10 cursor-pointer transition-colors tracking-wider"
          >
            <Menu className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
