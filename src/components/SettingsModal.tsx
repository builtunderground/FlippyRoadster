import React from 'react';
import { X, HelpCircle, Volume2, VolumeX, Music, Monitor, RotateCcw } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-slate-950 border border-slate-700 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="font-pixel text-base sm:text-lg text-white">
              MANUAL & SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* How to Play Section */}
        <div className="my-4 space-y-3">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
            Flight Operation Controls
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="bg-black/60 border border-slate-800 p-3 rounded flex items-center justify-between">
              <div>
                <div className="text-white font-bold mb-0.5">TAP / SPACEBAR / CLICK</div>
                <div className="text-slate-400 text-[11px]">
                  Fires cold-gas thruster for upward vertical impulse.
                </div>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                -150 PSI
              </span>
            </div>

            <div className="bg-black/60 border border-slate-800 p-3 rounded flex items-center justify-between">
              <div>
                <div className="text-white font-bold mb-0.5">PRESS [B] / [SHIFT] / [R] / HOLD 0.4s</div>
                <div className="text-slate-400 text-[11px]">
                  Executes a 360° barrel roll granting invincibility through obstacles.
                </div>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded">
                -1,800 PSI
              </span>
            </div>

            <div className="bg-black/60 border border-slate-800 p-3 rounded flex items-center justify-between">
              <div>
                <div className="text-white font-bold mb-0.5">COASTING (AIR RECHARGE)</div>
                <div className="text-slate-400 text-[11px]">
                  Not thrusting allows onboard compressors to recharge compressed air tank.
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                +REPLENISH
              </span>
            </div>
          </div>
        </div>

        {/* Audio & Visual Options */}
        <div className="mb-4 space-y-2.5">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
            Audio & Display Options
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>Sound Effects (Web Audio Engine)</span>
            </div>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 rounded text-xs font-pixel transition-colors ${
                !isMuted ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {!isMuted ? 'ON' : 'MUTED'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
              <Music className="w-4 h-4 text-purple-400" />
              <div>
                <span className="block font-bold text-white">Flippy Roadster Soundtrack</span>
                <span className="block text-[10px] text-slate-400">Official Theme (FlippyRoadster1.mp3)</span>
              </div>
            </div>
            <button
              onClick={onToggleMusic}
              className={`px-3 py-1 rounded text-xs font-pixel transition-colors ${
                !isMusicMuted ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {!isMusicMuted ? 'PLAYING' : 'MUTED'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-purple-300 font-bold">Custom Soundtrack File</span>
              <span className="text-[10px] font-mono text-slate-400">Load your own background audio track</span>
            </div>
            <label
              htmlFor="custom-audio-input"
              className="px-3 py-1 rounded text-xs font-pixel bg-cyan-950 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900 cursor-pointer transition-colors"
            >
              CHOOSE FILE
            </label>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
              <Monitor className="w-4 h-4 text-amber-400" />
              <span>CRT Retro Scanlines Effect</span>
            </div>
            <button
              onClick={onToggleScanlines}
              className={`px-3 py-1 rounded text-xs font-pixel transition-colors ${
                scanlinesEnabled ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {scanlinesEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset career records and skin unlocks?')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Career Record</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-pixel text-xs rounded transition-colors cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
