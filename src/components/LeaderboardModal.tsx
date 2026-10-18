import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, RotateCcw, User, PlusCircle } from 'lucide-react';
import { GameLogo } from './ui/GameLogo';
import { GameStats, LeaderboardEntry } from '../types/game';
import { getLeaderboard, addLeaderboardEntry, getLastPilotInitials, resetLeaderboard } from '../utils/leaderboard';
import { ArcadeInitialsInput } from './ui/ArcadeInitialsInput';
import { ShantiisanFooter } from './ui/ShantiisanFooter';

interface LeaderboardModalProps {
  stats: GameStats;
  currentRunScore?: number;
  currentRunSpeed?: number;
  currentSkinName?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  stats,
  currentRunScore,
  currentRunSpeed,
  currentSkinName = 'Tesla Roadster',
  onClose
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [showInput, setShowInput] = useState<boolean>(() => {
    // Show input automatically if player has an unsubmitted run score > 0
    return (currentRunScore !== undefined && currentRunScore > 0);
  });
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const handleInitialsSubmit = (initials: string) => {
    const scoreToRecord = currentRunScore !== undefined && currentRunScore > 0 ? currentRunScore : stats.highScore;
    const speedToRecord = currentRunSpeed !== undefined && currentRunSpeed > 0 ? currentRunSpeed : stats.maxSpeed;

    const { updatedLeaderboard, newRank } = addLeaderboardEntry(
      initials,
      scoreToRecord,
      speedToRecord,
      currentSkinName
    );

    setEntries(updatedLeaderboard);
    setShowInput(false);
    // Find the newly added entry to highlight
    const added = updatedLeaderboard[newRank - 1];
    if (added) {
      setSubmittedId(added.id);
    }
  };

  const handleResetScores = () => {
    if (window.confirm('Reset arcade high score leaderboard to factory defaults?')) {
      const reset = resetLeaderboard();
      setEntries(reset);
      setSubmittedId(null);
    }
  };

  // Find player rank among entries
  const playerTopScore = Math.max(stats.highScore, currentRunScore || 0);
  const playerRank = entries.length > 0 ? entries.filter((e) => e.score > playerTopScore).length + 1 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm select-none overflow-y-auto">
      <div className="bg-[#050505] border border-neutral-800 max-w-lg w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] relative my-auto">
        {/* Technical Corner Registration Marks */}
        <div className="absolute top-1 left-1 font-mono text-[9px] text-neutral-600">⌜ PILOT-LOG ⌝</div>
        <div className="absolute top-1 right-1 font-mono text-[9px] text-neutral-600">⌞ RANK-01 ⌟</div>

        {/* Flippy Roadster Game Logo */}
        <div className="flex flex-col items-center mb-2">
          <GameLogo size="sm" showSubtitle={false} className="drop-shadow-[0_0_16px_rgba(232,33,39,0.7)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-oxanium font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                  ARCADE HIGH SCORES
                </h2>
                <span className="font-mono text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30">
                  TOP 10
                </span>
              </div>
              <div className="font-kanji text-[10px] text-neutral-400">
                飛行殿堂 · 3文字イニシャル登録
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional 3-Letter Initials Input Section */}
        {showInput ? (
          <div className="my-3 flex flex-col items-center">
            <ArcadeInitialsInput
              initialValue={getLastPilotInitials()}
              score={currentRunScore !== undefined && currentRunScore > 0 ? currentRunScore : stats.highScore}
              onSubmit={handleInitialsSubmit}
            />
            <button
              onClick={() => setShowInput(false)}
              className="mt-2 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
            >
              Skip to Leaderboard &rarr;
            </button>
          </div>
        ) : (
          /* Active Pilot Status Banner */
          <div className="my-2.5 bg-neutral-950 border border-amber-500/40 p-2.5 sm:p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500/10 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-oxanium font-bold text-xs text-white">YOUR CALLSIGN</span>
                  <span className="font-mono text-[9px] text-amber-400 font-bold bg-neutral-900 px-1 border border-neutral-800">
                    [{getLastPilotInitials()}]
                  </span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  STANDINGS: #{playerRank <= 10 ? playerRank : '>10'} &middot; {stats.totalRuns} MISSIONS
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-doto text-lg sm:text-xl text-amber-300 tabular-nums font-bold leading-none">
                  {playerTopScore} <span className="font-oxanium text-[10px] text-amber-400 font-normal">FT</span>
                </div>
                <div className="text-[8px] font-mono text-neutral-500">BEST RECORD</div>
              </div>

              {/* Enter Initials Trigger Button */}
              <button
                type="button"
                onClick={() => setShowInput(true)}
                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-[10px] font-oxanium font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Enter 3-Letter Callsign"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EDIT</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Standings Table */}
        <div className="flex-1 overflow-y-auto space-y-1 my-1 pr-1 max-h-[46vh]">
          <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-wider pb-1 border-b border-neutral-900">
            <span>RANK &middot; PILOT &middot; VEHICLE</span>
            <span>DISTANCE CLEARED</span>
          </div>

          {Array.from({ length: 10 }, (_, index) => {
            const rank = index + 1;
            const entry = entries[index];
            if (!entry) {
              return (
                <div
                  key={`empty-${rank}`}
                  className="flex items-center justify-between p-2 bg-neutral-950/40 border border-neutral-900/60 text-neutral-600"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-oxanium text-xs w-6 text-center shrink-0 text-neutral-600">
                      #{rank.toString().padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-doto font-bold text-xs sm:text-sm tracking-widest text-neutral-600 bg-black px-1.5 py-0.5 border border-neutral-900">
                        ---
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-neutral-600 truncate">
                      [EMPTY SLOT &middot; AWAITING PILOT]
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2 font-mono text-[10px] text-neutral-700 tabular-nums">
                    --- FT
                  </div>
                </div>
              );
            }

            const isHighlighted = entry.id === submittedId || entry.isPlayer;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 transition-all ${
                  isHighlighted
                    ? 'bg-amber-500/10 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-black border border-neutral-900 hover:border-neutral-800'
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-doto font-bold text-sm sm:text-base tracking-widest text-amber-300 bg-neutral-950 px-1.5 py-0.5 border border-neutral-800">
                      {entry.initials}
                    </span>
                  </div>

                  {/* Vehicle Skin and Spec Info */}
                  <div className="min-w-0 truncate">
                    <div className="font-oxanium font-bold text-xs text-neutral-200 truncate flex items-center gap-1.5">
                      <span>{entry.skinName}</span>
                      {entry.isPlayer && (
                        <span className="text-[8px] font-mono text-cyan-400 border border-cyan-500/40 px-1">
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
                    {entry.score.toLocaleString()} <span className="text-[9px] text-amber-400 font-normal font-oxanium">FT</span>
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
            DISMISS &middot; 閉じる
          </button>
        </div>

        {/* Shantiisan Official Copyright */}
        <div className="mt-2 pt-2 border-t border-neutral-900">
          <ShantiisanFooter />
        </div>
      </div>
    </div>
  );
};
