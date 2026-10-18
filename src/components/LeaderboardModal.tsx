import React from 'react';
import { X, Trophy, Medal, User } from 'lucide-react';
import { GameLogo } from './ui/GameLogo';
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
    { rank: 1, name: 'Starman 🛰️', score: 142, vehicle: 'Starman Edition', badge: 'DEEP SPACE' },
    { rank: 2, name: 'Technoking ⚡', score: 98, vehicle: 'SpaceX Stainless', badge: 'ORBITAL' },
    { rank: 3, name: 'Franz v. H. 🔨', score: 84, vehicle: 'Ultra Red', badge: 'HIGH G' },
    { rank: 4, name: 'CyberGiga 📐', score: 62, vehicle: 'SpaceX Stainless', badge: 'AERO' },
    { rank: 5, name: 'RocketBoy 🚀', score: 45, vehicle: 'Ano White', badge: 'SUBORBITAL' }
  ];

  // Insert player into ranked list
  const playerRank =
    mockPilots.filter((p) => p.score > stats.highScore).length + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#050505] border border-neutral-800 max-w-lg w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative">
        {/* Technical Corner Registration Marks */}
        <div className="absolute top-1 left-1 font-mono text-[9px] text-neutral-600">⌜ PILOT-LOG ⌝</div>
        <div className="absolute top-1 right-1 font-mono text-[9px] text-neutral-600">⌞ RANK-01 ⌟</div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <GameLogo size="xs" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-oxanium font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                  PILOT HALL OF FAME
                </h2>
                <span className="font-mono text-[9px] text-neutral-500">[RANKINGS]</span>
              </div>
              <div className="font-kanji text-[10px] text-neutral-400">
                パイロット飛行殿堂 · 軌道到達記録
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

        {/* Player Personal Card */}
        <div className="my-3 bg-neutral-950 border border-amber-500/50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 text-amber-300 flex items-center justify-center border border-amber-500/40">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="font-oxanium font-bold text-xs text-white">YOU (ACTIVE PILOT)</div>
              <div className="text-[10px] font-mono text-neutral-400">
                RANK #{playerRank} &middot; {stats.totalRuns} FLIGHTS RECORDED
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-doto text-xl sm:text-2xl text-amber-300 tabular-nums font-bold leading-none">
              {stats.highScore} <span className="font-oxanium text-xs text-amber-400 font-normal">FT</span>
            </div>
            <div className="text-[9px] font-mono text-neutral-500">PERSONAL BEST</div>
          </div>
        </div>

        {/* Global Standings Table */}
        <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 pr-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
            <span>Global Starbase Telemetry</span>
            <span className="font-kanji text-neutral-600">公式ランキング</span>
          </div>

          {mockPilots.map((pilot) => {
            return (
              <div
                key={pilot.name}
                className="flex items-center justify-between p-2 bg-black border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-oxanium font-bold text-xs w-6 text-center ${
                      pilot.rank === 1
                        ? 'text-amber-400'
                        : pilot.rank === 2
                        ? 'text-neutral-300'
                        : pilot.rank === 3
                        ? 'text-amber-600'
                        : 'text-neutral-500'
                    }`}
                  >
                    0{pilot.rank}
                  </span>
                  <div>
                    <div className="font-oxanium font-bold text-xs text-neutral-200">
                      {pilot.name}
                    </div>
                    <div className="text-[9px] font-mono text-neutral-500">
                      {pilot.vehicle} &middot; [{pilot.badge}]
                    </div>
                  </div>
                </div>

                <div className="font-oxanium font-bold text-sm text-white tabular-nums">
                  {pilot.score} <span className="text-[9px] text-neutral-500 font-normal">FT</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-oxanium font-bold text-xs border border-neutral-700 cursor-pointer transition-colors"
          >
            DISMISS &middot; 閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
