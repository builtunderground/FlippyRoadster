import React from 'react';
import { RotateCcw, Wrench, Menu, Award, Trophy, Zap } from 'lucide-react';
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
  onOpenGarage: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  maxSpeed,
  barrelRolls,
  currentSkin,
  quote,
  onRestart,
  onOpenGarage,
  onMainMenu
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-slate-950 border-2 border-red-600/70 rounded-xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(232,33,39,0.3)] text-center flex flex-col items-center">
        {/* Game Over Title */}
        <div className="font-pixel text-2xl sm:text-3xl text-red-600 mb-1 tracking-wider drop-shadow-[0_0_12px_rgba(232,33,39,0.6)]">
          MISSION ABORT
        </div>
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
          TELEMETRY SIGNAL LOST
        </div>

        {/* Deadpan Quote */}
        <div className="w-full bg-black/60 border border-slate-800 rounded p-2.5 mb-4 text-xs font-mono text-slate-300 italic">
          "{quote}"
        </div>

        {/* Score & Highlights Box */}
        <div className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-4 mb-5">
          <div className="text-xs font-retro text-cyan-400 uppercase tracking-wider mb-1">
            Distance Cleared
          </div>
          <div className="font-pixel text-4xl text-white mb-2 tabular-nums font-bold">
            {score}{' '}
            <span className="text-lg text-slate-400 font-normal">FT</span>
          </div>

          {isNewHigh && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/60 rounded-full text-amber-300 font-pixel text-[10px] mb-3 animate-bounce">
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW PERSONAL RECORD!</span>
            </div>
          )}

          {/* Detailed Telemetry Stats */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[11px] font-mono">
            <div className="flex flex-col items-center">
              <span className="text-slate-500">PEAK SPEED</span>
              <span className="text-white font-bold tabular-nums">
                {Math.round(maxSpeed)} MPH
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-500">BARREL ROLLS</span>
              <span className="text-cyan-400 font-bold tabular-nums">
                {barrelRolls}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-500">BEST RUN</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {highScore} FT
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full font-pixel text-xs">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded border border-red-400 shadow-[0_0_15px_rgba(232,33,39,0.5)] cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY RUN (SPACE)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenGarage}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-cyan-500/40 cursor-pointer transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>GARAGE</span>
            </button>

            <button
              onClick={onMainMenu}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 cursor-pointer transition-colors hover:text-white"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
