import React, { useState, useEffect } from 'react';
import { X, Trophy, Check, Edit3, RotateCcw } from 'lucide-react';
import { GameLogo } from './ui/GameLogo';
import { GameStats, LeaderboardEntry } from '../types/game';
import {
  getLeaderboard,
  getLastPilotInitials,
  updateLeaderboardEntryInitials,
  resetLeaderboard,
  subscribeToSharedLeaderboard
} from '../utils/leaderboard';
import { ShantiisanFooter } from './ui/ShantiisanFooter';

interface LeaderboardModalProps {
  stats: GameStats;
  currentRunScore?: number;
  currentRunSpeed?: number;
  currentSkinName?: string;
  activeEntryId?: string;
  activeRank?: number;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  stats,
  currentRunScore,
  activeEntryId,
  onClose
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [initials, setInitials] = useState<string>(() => getLastPilotInitials());
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);

  useEffect(() => {
    setEntries(getLeaderboard());
    const unsubscribe = subscribeToSharedLeaderboard((live) => {
      setEntries(live);
    });
    return () => unsubscribe();
  }, []);

  const activeRunScore = currentRunScore !== undefined && currentRunScore > 0 ? currentRunScore : 0;
  const bestScore = Math.max(stats.highScore, activeRunScore);

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    setInitials(val);
  };

  const handleCommitInitials = async () => {
    setIsEditingCallsign(false);
    const clean = (initials || 'TAV').toUpperCase().slice(0, 3);
    const updated = await updateLeaderboardEntryInitials(clean, activeEntryId);
    setEntries(updated);
  };

  const handleResetScores = () => {
    if (window.confirm('Reset arcade leaderboard to default factory records?')) {
      const reset = resetLeaderboard();
      setEntries(reset);
    }
  };

  // Find player rank in current standings
  const playerRank = entries.length > 0 ? entries.filter((e) => e.score > bestScore).length + 1 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-neutral-800 max-w-lg w-full p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <h2 className="font-oxanium font-bold text-base sm:text-lg text-white uppercase tracking-wider">
              ARCADE HIGH SCORES
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <GameLogo size="xs" showSubtitle={false} />
            <button
              onClick={onClose}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Streamlined Callsign Bar (Unobtrusive & Centered on the Standings) */}
        <div className="my-2 p-2 bg-neutral-950 flex flex-wrap items-center justify-between gap-2 border border-neutral-900">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">CALLSIGN:</span>
            {isEditingCallsign ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={initials}
                  onChange={handleInitialsChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitInitials();
                  }}
                  maxLength={3}
                  autoFocus
                  placeholder="TAV"
                  className="w-14 bg-black border border-amber-400 text-amber-300 font-doto font-bold text-sm text-center uppercase tracking-widest px-1 py-0.5 outline-none"
                />
                <button
                  onClick={handleCommitInitials}
                  className="p-1 bg-amber-500/20 text-amber-300 cursor-pointer"
                  title="Save callsign"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingCallsign(true)}
                className="group flex items-center gap-1.5 bg-black px-2 py-0.5 border border-neutral-800 hover:border-amber-400 transition-colors cursor-pointer"
                title="Tap to edit pilot initials"
              >
                <span className="font-doto font-bold text-sm tracking-widest text-amber-300">
                  {initials || 'TAV'}
                </span>
                <Edit3 className="w-3 h-3 text-neutral-500 group-hover:text-amber-300 transition-colors" />
              </button>
            )}
          </div>

          <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2">
            {activeRunScore > 0 ? (
              <span className="text-amber-300 font-oxanium font-bold">
                LAST RUN: {activeRunScore.toLocaleString()} FT (RANK #{playerRank})
              </span>
            ) : (
              <span>
                BEST: <span className="text-white font-bold font-oxanium">{bestScore.toLocaleString()} FT</span>
              </span>
            )}
          </div>
        </div>

        {/* Leaderboard Table (The Dominant Centerpiece) */}
        <div className="flex-1 overflow-y-auto space-y-1 my-1 pr-1 max-h-[50vh]">
          <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-900">
            <span>RANK &middot; PILOT &middot; VEHICLE</span>
            <span>DISTANCE</span>
          </div>

          {Array.from({ length: 10 }, (_, index) => {
            const rank = index + 1;
            const entry = entries[index];
            if (!entry) {
              return (
                <div
                  key={`empty-${rank}`}
                  className="flex items-center justify-between p-2 bg-neutral-950/20 text-neutral-700 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-oxanium text-xs w-6 text-center text-neutral-700">
                      #{rank.toString().padStart(2, '0')}
                    </span>
                    <span className="font-doto text-xs tracking-widest text-neutral-800">---</span>
                    <span className="text-[9px] font-mono text-neutral-700">[EMPTY SLOT]</span>
                  </div>
                  <div className="font-mono text-[10px] text-neutral-800">--- FT</div>
                </div>
              );
            }

            const isHighlighted = (activeEntryId && entry.id === activeEntryId) || entry.isPlayer;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 transition-colors ${
                  isHighlighted
                    ? 'bg-amber-500/10 border border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-black/80 hover:bg-neutral-950'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank Badge */}
                  <span
                    className={`font-oxanium font-bold text-xs w-6 text-center shrink-0 ${
                      rank === 1
                        ? 'text-amber-300 font-black'
                        : rank === 2
                        ? 'text-slate-200'
                        : rank === 3
                        ? 'text-amber-600'
                        : 'text-neutral-500'
                    }`}
                  >
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank.toString().padStart(2, '0')}`}
                  </span>

                  {/* 3-Letter Initials */}
                  <span className="font-doto font-bold text-sm tracking-widest text-amber-300 bg-neutral-950 px-1.5 py-0.5 border border-neutral-900 shrink-0">
                    {entry.initials}
                  </span>

                  {/* Vehicle Skin and Spec Info */}
                  <div className="min-w-0 truncate">
                    <div className="font-oxanium font-bold text-xs text-neutral-200 truncate flex items-center gap-1.5">
                      <span>{entry.skinName}</span>
                      {entry.isPlayer && (
                        <span className="text-[8px] font-mono text-amber-400 border border-amber-500/40 px-1 bg-amber-500/10">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[8px] font-mono text-neutral-500 truncate">
                      {entry.maxSpeed} MPH &middot; {entry.date}
                    </div>
                  </div>
                </div>

                {/* Score in FT */}
                <div className="text-right shrink-0 ml-2">
                  <div className="font-doto font-bold text-sm sm:text-base text-white tabular-nums">
                    {entry.score.toLocaleString()}{' '}
                    <span className="text-[9px] text-amber-400 font-normal font-oxanium">FT</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 mt-2 border-t border-neutral-900 flex items-center justify-between text-xs">
          <button
            onClick={handleResetScores}
            className="flex items-center gap-1 text-[9px] font-mono text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Reset Leaderboard"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET SCORES</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-oxanium font-bold text-xs border border-neutral-700 cursor-pointer transition-colors"
          >
            DISMISS
          </button>
        </div>

        {/* Clean Shantiisan Official Copyright with TAV Logo */}
        <div className="mt-2.5 pt-2 border-t border-neutral-900/80">
          <ShantiisanFooter />
        </div>
      </div>
    </div>
  );
};
