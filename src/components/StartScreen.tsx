import React from 'react';
import { Play, Wrench, Trophy, HelpCircle, Flame, Shield } from 'lucide-react';
import { Skin } from '../types/game';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  highScore: number;
  currentSkin: Skin;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenGarage,
  onOpenLeaderboard,
  onOpenSettings,
  highScore,
  currentSkin
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 bg-black/55 backdrop-blur-[2px] select-none text-white overflow-y-auto">
      {/* Top Bar with Brand & Personal High Score */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          {/* Tesla Logo */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-red-600">
            <path d="M12 2C8.5 2 5.5 3 3 5l2 3c2-1.5 4.5-2.2 7-2.2s5 .7 7 2.2l2-3C18.5 3 15.5 2 12 2zm0 6c-2 0-3.8.5-5.3 1.5L8 12.2c1.2-.8 2.6-1.2 4-1.2s2.8.4 4 1.2l1.3-2.7C15.8 8.5 14 8 12 8zm-1 6v8h2v-8h-2z" />
          </svg>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
            Tesla x SpaceX Concept
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 px-3 py-1 rounded text-xs font-mono">
          <span className="text-slate-400">BEST RECORD:</span>
          <span className="text-cyan-400 font-bold font-pixel">{highScore} FT</span>
        </div>
      </div>

      {/* Hero Brand & Main Menu */}
      <div className="max-w-4xl w-full mx-auto my-auto flex flex-col md:flex-row items-center justify-between gap-8 py-6">
        {/* Left Column: Title & Menu */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          {/* Main Flippy Roadster Pixel Logo */}
          <div className="mb-2 flex flex-col items-center md:items-start">
            <img
              src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
              alt="Flippy Roadster"
              className="h-16 sm:h-22 md:h-26 w-auto object-contain pixelated drop-shadow-[0_0_20px_rgba(232,33,39,0.5)]"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('tristanvogt.com')) {
                  target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
                }
              }}
            />
          </div>

          <p className="font-retro text-cyan-300 text-xs sm:text-sm tracking-widest mb-6">
            HOP TO 2028 · SPACEX PACKAGE
          </p>

          {/* Action Menu List */}
          <div className="flex flex-col gap-2.5 w-full max-w-xs font-pixel text-sm">
            <button
              onClick={onStartGame}
              className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white py-3.5 px-6 rounded border-2 border-red-400 shadow-[0_0_20px_rgba(232,33,39,0.5)] cursor-pointer transition-all hover:scale-105 active:scale-95 group"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>START RUN</span>
            </button>

            <button
              onClick={onOpenGarage}
              className="flex items-center justify-center gap-3 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 py-2.5 px-5 rounded border border-cyan-500/40 cursor-pointer transition-all hover:border-cyan-400"
            >
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>GARAGE</span>
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="flex items-center justify-center gap-3 bg-slate-900/90 hover:bg-slate-800 text-amber-300 py-2.5 px-5 rounded border border-amber-500/40 cursor-pointer transition-all hover:border-amber-400"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>LEADERBOARD</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 py-2 px-5 rounded border border-slate-700 cursor-pointer transition-all hover:text-white"
            >
              <HelpCircle className="w-4 h-4" />
              <span>HOW TO PLAY</span>
            </button>
          </div>
        </div>

        {/* Right Column: Vehicle Preview & Quick Mechanics */}
        <div className="flex flex-col items-center bg-slate-900/80 border border-slate-700/80 p-5 rounded-lg max-w-sm w-full">
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-2">
            Active Vehicle Configuration
          </div>

          <div className="font-pixel text-sm text-white mb-1">{currentSkin.name}</div>
          <div className="text-xs text-slate-400 text-center mb-4 leading-relaxed">
            {currentSkin.description}
          </div>

          {/* Quick Controls Card */}
          <div className="w-full bg-black/60 border border-slate-800 rounded p-3 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>TAP / SPACE</span>
              </span>
              <span>FIRE THRUSTER</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>KEY [B] / SHIFT</span>
              </span>
              <span>360° BARREL ROLL</span>
            </div>

            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 text-center">
              Press [B] or [SHIFT] to roll with invincibility shield (1,800 PSI).
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3-Phase Progression Cards (Directly matching user design mockup) */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-800/80">
        {/* Phase 1 Card */}
        <div className="bg-slate-950/80 border border-cyan-900/60 p-3 sm:p-4 rounded flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs font-bold text-cyan-400 mb-1 flex items-center justify-between">
              <span>1. WACO STAGING GROUND</span>
              <span className="text-[10px] text-slate-400">(0 – 25 FT)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Launch off the Waco steel ramp past the illuminated Tesla marquee and parked fleets.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-500">
            Cyberpunk Structures: Tesla Gigafactory marquee, steel ramps & floodlights.
          </div>
        </div>

        {/* Phase 2 Card */}
        <div className="bg-slate-950/80 border border-purple-900/60 p-3 sm:p-4 rounded flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs font-bold text-purple-400 mb-1 flex items-center justify-between">
              <span>2. CYBER COMPLEX</span>
              <span className="text-[10px] text-slate-400">(26 – 75 FT)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Navigate Mechazilla gantry towers, hazard arms, and flashing FAA regulatory gates.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-500">
            Cyberpunk Structures: Mechazilla towers, CYBER neon signage & cryo vents.
          </div>
        </div>

        {/* Phase 3 Card */}
        <div className="bg-slate-950/80 border border-sky-900/60 p-3 sm:p-4 rounded flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs font-bold text-sky-400 mb-1 flex items-center justify-between">
              <span>3. STARBASE CITY</span>
              <span className="text-[10px] text-slate-400">(76+ FT)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fly past high-tech launch complexes, fuel conduits, and Starman drifting under the stars.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-500">
            Cyberpunk Structures: Mega-VAB facilities, SPACEX marquees & Starman.
          </div>
        </div>
      </div>
    </div>
  );
};
