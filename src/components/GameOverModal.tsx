import React from 'react';
import { RotateCcw, Menu, Trophy, Shield } from 'lucide-react';
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none touch-none">
      <div className="bg-slate-950 border-2 border-red-600/80 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-[0_0_50px_rgba(232,33,39,0.35)] text-center flex flex-col items-center">
        {/* Title */}
        <div className="font-pixel text-xl sm:text-2xl text-red-600 mb-1 tracking-wider drop-shadow-[0_0_12px_rgba(232,33,39,0.7)]">
          MISSION ABORT
        </div>

        {/* Deadpan quote */}
        <div className="w-full bg-black/60 border border-slate-800 rounded-lg p-2.5 my-3 text-xs font-mono text-slate-300 italic">
          "{quote}"
        </div>

        {/* Score Card */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-4">
          <div className="text-[10px] font-retro text-cyan-400 uppercase tracking-widest mb-1">
            DISTANCE CLEARED
          </div>
          <div className="font-pixel text-3xl sm:text-4xl text-white mb-2 tabular-nums font-bold">
            {score} <span className="text-base text-slate-400 font-normal">FT</span>
          </div>

          {isNewHigh ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/60 rounded-full text-amber-300 font-pixel text-[10px] animate-bounce">
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW RECORD!</span>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-400">
              BEST RECORD: <span className="text-amber-400 font-bold">{highScore} FT</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full font-pixel text-xs">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2.5 w-full py-4 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl border border-red-400 shadow-[0_0_20px_rgba(232,33,39,0.55)] cursor-pointer transition-all animate-pulse"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY (TAP OR SPACE)</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 rounded-xl border border-slate-700 cursor-pointer transition-colors hover:text-white"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
