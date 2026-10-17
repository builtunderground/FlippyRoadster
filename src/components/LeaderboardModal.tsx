import React from 'react';
import { X, Trophy, Medal, User } from 'lucide-react';
import { GameStats } from '../types/game';

interface LeaderboardModalProps {
  stats: GameStats;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  stats,
  onClose
}) => {
  // Mock leaderboard combined with real player record
  const mockPilots = [
    { rank: 1, name: 'Starman 🛰️', score: 142, vehicle: 'Starman Edition' },
    { rank: 2, name: 'Technoking ⚡', score: 98, vehicle: 'SpaceX Stainless' },
    { rank: 3, name: 'Franz v. H. 🔨', score: 84, vehicle: 'Ultra Red' },
    { rank: 4, name: 'CyberGiga 📐', score: 62, vehicle: 'SpaceX Stainless' },
    { rank: 5, name: 'RocketBoy 🚀', score: 45, vehicle: 'Ano White' }
  ];

  // Insert player into ranked list
  const playerRank =
    mockPilots.filter((p) => p.score > stats.highScore).length + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-slate-950 border border-amber-500/40 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-[0_0_35px_rgba(245,158,11,0.2)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-base sm:text-lg text-white">
              PILOT HALL OF FAME
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Personal Card */}
        <div className="my-4 bg-slate-900/90 border border-amber-500/50 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-pixel text-xs text-white">YOU (PILOT)</div>
              <div className="text-[10px] font-mono text-slate-400">
                Rank #{playerRank} · {stats.totalRuns} Flights Total
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-pixel text-base text-amber-300 tabular-nums font-bold">
              {stats.highScore} FT
            </div>
            <div className="text-[9px] font-retro text-slate-400">PERSONAL BEST</div>
          </div>
        </div>

        {/* Global Standings Table */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            Global High Orbit Telemetry
          </div>

          {mockPilots.map((pilot) => {
            const isUserBetter = stats.highScore >= pilot.score;
            return (
              <div
                key={pilot.name}
                className="flex items-center justify-between p-2.5 rounded bg-black/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-pixel text-xs w-5 text-center ${
                      pilot.rank === 1
                        ? 'text-amber-400 font-bold'
                        : pilot.rank === 2
                        ? 'text-slate-300'
                        : pilot.rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-500'
                    }`}
                  >
                    #{pilot.rank}
                  </span>
                  <div>
                    <div className="font-pixel text-xs text-slate-200">
                      {pilot.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {pilot.vehicle}
                    </div>
                  </div>
                </div>

                <div className="font-pixel text-sm text-cyan-400 tabular-nums">
                  {pilot.score} FT
                </div>
              </div>
            );
          })}
        </div>

        {/* Lifetime Telemetry Stats */}
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded text-xs font-mono grid grid-cols-2 gap-2 text-slate-300 mb-4">
          <div>
            Total Feet Cleared:{' '}
            <span className="text-white font-bold">{stats.totalFeetCleared} FT</span>
          </div>
          <div>
            Total Barrel Rolls:{' '}
            <span className="text-cyan-400 font-bold">{stats.barrelRolls}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-pixel text-xs rounded border border-slate-700 transition-colors cursor-pointer"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
