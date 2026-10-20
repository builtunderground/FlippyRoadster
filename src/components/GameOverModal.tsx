import React, { useState } from 'react';
import { RotateCcw, Menu, Trophy, Check } from 'lucide-react';
import { Skin } from '../types/game';
import { GameLogo } from './ui/GameLogo';
import { ShantiisanFooter } from './ui/ShantiisanFooter';
import { getLastPilotInitials, saveLastPilotInitials } from '../utils/leaderboard';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  maxSpeed: number;
  barrelRolls: number;
  currentSkin: Skin;
  leaderboardRank?: number;
  activeEntryId?: string;
  onUpdateInitials?: (newInitials: string) => void;
  onRestart: () => void;
  onOpenGarage?: () => void;
  onOpenLeaderboard?: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  leaderboardRank,
  onUpdateInitials,
  onRestart,
  onOpenLeaderboard,
  onMainMenu
}) => {
  const [initials, setInitials] = useState(() => getLastPilotInitials());
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveInitials = (override?: string) => {
    const valToSave = typeof override === 'string' ? override : initials;
    const clean = (valToSave || 'TAV').toUpperCase().slice(0, 3);
    saveLastPilotInitials(clean);
    onUpdateInitials?.(clean);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    setInitials(val);
    if (val.length === 3) {
      handleSaveInitials(val);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none touch-none overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-red-600/40 max-w-md w-full p-5 sm:p-6 shadow-[0_0_50px_rgba(232,33,39,0.2)] text-center flex flex-col items-center relative my-auto">
        {/* Game Logo */}
        <div className="mb-2 pt-1 flex justify-center w-full">
          <GameLogo size="lg" showSubtitle={false} className="drop-shadow-[0_0_20px_rgba(232,33,39,0.7)]" />
        </div>

        {/* Mission Status Header */}
        <div className="text-red-500 mb-2">
          <h2 className="font-oxanium font-bold text-2xl sm:text-3xl tracking-wider uppercase drop-shadow-[0_0_10px_rgba(232,33,39,0.5)]">
            MISSION ABORT
          </h2>
        </div>

        {/* Clean Telemetry Distance & Leaderboard Standing */}
        <div className="w-full bg-black/90 border border-neutral-800 p-4 my-2 flex flex-col items-center">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
            DISTANCE CLEARED
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-doto text-4xl sm:text-5xl text-white font-bold tracking-tight tabular-nums leading-none">
              {score.toLocaleString()}
            </span>
            <span className="font-oxanium text-base text-red-500 font-bold uppercase tracking-wider">
              FT
            </span>
          </div>

          {/* Prominent Leaderboard Rank Badge */}
          {leaderboardRank !== undefined && leaderboardRank > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-400 text-amber-300 font-oxanium font-bold text-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {leaderboardRank <= 10
                  ? `GLOBAL LEADERBOARD: RANK #${leaderboardRank}`
                  : `GLOBAL STANDINGS: RANK #${leaderboardRank}`}
              </span>
            </div>
          ) : isNewHigh ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-400 text-amber-300 font-oxanium font-bold text-xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW PERSONAL RECORD</span>
            </div>
          ) : (
            <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
              <span>CAREER BEST:</span>
              <span className="text-white font-bold font-oxanium">{highScore.toLocaleString()} FT</span>
            </div>
          )}

          {/* Pilot Callsign / Initials Input directly on GameOver */}
          {score > 0 && (
            <div className="mt-3 pt-2.5 border-t border-neutral-800 w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">CALLSIGN:</span>
                <input
                  type="text"
                  value={initials}
                  onChange={handleInitialsChange}
                  onBlur={() => handleSaveInitials()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveInitials();
                  }}
                  maxLength={3}
                  placeholder="TAV"
                  className="w-14 bg-black border border-amber-400 text-amber-300 font-doto font-bold text-sm text-center uppercase tracking-widest px-1 py-0.5 outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleSaveInitials()}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-oxanium font-bold border border-amber-500/40 cursor-pointer transition-colors flex items-center gap-1"
                >
                  {savedFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                  <span>{savedFeedback ? 'SAVED' : 'SAVE'}</span>
                </button>
              </div>
              <span className="text-[9px] font-mono text-neutral-500 uppercase">
                {savedFeedback ? 'RECORD SAVED' : 'ENTER INITIALS'}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 w-full font-oxanium font-bold text-xs sm:text-sm mt-1">
          {/* RETRY BUTTON */}
          <button
            onClick={onRestart}
            className="flex items-center justify-between w-full py-3 px-5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-[0_0_20px_rgba(232,33,39,0.35)] cursor-pointer transition-all tracking-wider"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>RETRY MISSION</span>
            </div>
            <span className="text-[10px] font-mono text-red-200 font-normal">[TAP OR SPACE]</span>
          </button>

          {/* ARCADE LEADERBOARD BUTTON */}
          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="flex items-center justify-between w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer transition-all tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>ARCADE LEADERBOARD</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-black px-2 py-0.5">
                {leaderboardRank ? `RANK #${leaderboardRank}` : 'VIEW STANDINGS'}
              </span>
            </button>
          )}

          {/* MAIN MENU BUTTON */}
          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-2.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-800 cursor-pointer transition-colors tracking-wider"
          >
            <Menu className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>

        {/* Footer with Shantiisan Official Copyright and TAV logo */}
        <div className="w-full mt-3 pt-2.5 border-t border-neutral-900">
          <ShantiisanFooter />
        </div>
      </div>
    </div>
  );
};
