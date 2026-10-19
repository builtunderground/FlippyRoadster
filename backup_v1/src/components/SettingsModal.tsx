import React from 'react';
import { X, HelpCircle, Volume2, VolumeX, Music, Monitor, RotateCcw } from 'lucide-react';
import { GameLogo } from './ui/GameLogo';

interface SettingsModalProps {
  isMuted: boolean;
  isMusicMuted: boolean;
  scanlinesEnabled: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleScanlines: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  isMusicMuted,
  scanlinesEnabled,
  onToggleMute,
  onToggleMusic,
  onToggleScanlines,
  onResetProgress,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#050505] border border-neutral-800 max-w-lg w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto relative">
        {/* Technical Corner Registration Marks */}
        <div className="absolute top-1 left-1 font-mono text-[9px] text-neutral-600">⌜ MANUAL-01 ⌝</div>
        <div className="absolute top-1 right-1 font-mono text-[9px] text-neutral-600">⌞ SYS-DOC ⌟</div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <GameLogo size="xs" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-oxanium font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                  FLIGHT MANUAL & SYSTEM CONFIG
                </h2>
              </div>
              <div className="font-kanji text-[10px] text-neutral-400">
                操縦マニュアル · システム設定
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

        {/* Flight Operation Controls */}
        <div className="my-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-900">
            <div className="text-[10px] font-oxanium font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400" />
              <span>FLIGHT OPERATION CONTROLS</span>
            </div>
            <span className="font-kanji text-[10px] text-neutral-500">操縦系統</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="bg-black border border-neutral-800 p-2.5 flex items-center justify-between">
              <div>
                <div className="text-white font-oxanium font-bold text-xs tracking-wider mb-0.5">
                  TAP / SPACEBAR / CLICK
                </div>
                <div className="text-neutral-400 text-[10px]">
                  Fires cold-gas thruster for upward vertical impulse.
                </div>
              </div>
              <span className="text-[9px] font-mono bg-neutral-900 text-cyan-400 border border-neutral-700 px-2 py-0.5">
                -80 PSI
              </span>
            </div>

            <div className="bg-black border border-neutral-800 p-2.5 flex items-center justify-between">
              <div>
                <div className="text-white font-oxanium font-bold text-xs tracking-wider mb-0.5">
                  PRESS [B] / [SHIFT] / [R] / HOLD 0.4s
                </div>
                <div className="text-neutral-400 text-[10px]">
                  Executes 360&deg; barrel roll granting invincibility through obstacles.
                </div>
              </div>
              <span className="text-[9px] font-mono bg-neutral-900 text-amber-400 border border-neutral-700 px-2 py-0.5">
                -1,800 PSI
              </span>
            </div>

            <div className="bg-black border border-neutral-800 p-2.5 flex items-center justify-between">
              <div>
                <div className="text-white font-oxanium font-bold text-xs tracking-wider mb-0.5">
                  COASTING (AIR RECHARGE)
                </div>
                <div className="text-neutral-400 text-[10px]">
                  Onboard compressors automatically recharge cold-gas reservoir.
                </div>
              </div>
              <span className="text-[9px] font-mono bg-neutral-900 text-emerald-400 border border-neutral-700 px-2 py-0.5">
                +REPLENISH
              </span>
            </div>
          </div>
        </div>

        {/* Audio & Visual Options */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-900">
            <div className="text-[10px] font-oxanium font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-600" />
              <span>SYSTEM PREFERENCES</span>
            </div>
            <span className="font-kanji text-[10px] text-neutral-500">環境設定</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-300">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
              <span>Sound Effects (Synthesizer Engine)</span>
            </div>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 text-xs font-oxanium font-bold transition-colors border cursor-pointer ${
                !isMuted
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-red-950 text-red-400 border-red-800'
              }`}
            >
              {!isMuted ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-300">
              <Music className={`w-4 h-4 ${isMusicMuted ? 'text-red-900/60' : 'text-red-500 drop-shadow-[0_0_6px_rgba(232,33,39,0.8)]'}`} />
              <span>Synthwave Soundtrack Track</span>
            </div>
            <button
              onClick={onToggleMusic}
              className={`px-3 py-1 text-xs font-oxanium font-bold transition-colors border cursor-pointer ${
                !isMusicMuted
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-neutral-900 text-neutral-500 border-neutral-800'
              }`}
            >
              {!isMusicMuted ? 'PLAYING' : 'MUTED'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-300">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Retro CRT Scanlines Overlay</span>
            </div>
            <button
              onClick={onToggleScanlines}
              className={`px-3 py-1 text-xs font-oxanium font-bold transition-colors border cursor-pointer ${
                scanlinesEnabled
                  ? 'bg-neutral-800 text-cyan-400 border-cyan-800'
                  : 'bg-neutral-900 text-neutral-500 border-neutral-800'
              }`}
            >
              {scanlinesEnabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Reset Career Stats */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset all flight logs and career statistics?')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-red-400 text-[10px] font-mono cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET CAREER STATS</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-oxanium font-bold text-xs border border-neutral-700 cursor-pointer transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
