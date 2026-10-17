import React, { useRef, useEffect } from 'react';
import { X, Lock, Check, Sparkles } from 'lucide-react';
import { Skin, ThrusterColor } from '../types/game';
import { SKINS, THRUSTER_COLORS, PixelRenderer } from '../utils/pixelRenderer';

interface GarageModalProps {
  currentSkin: Skin;
  currentThruster: ThrusterColor;
  highScore: number;
  onSelectSkin: (skin: Skin) => void;
  onSelectThruster: (thruster: ThrusterColor) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  currentSkin,
  currentThruster,
  highScore,
  onSelectSkin,
  onSelectThruster,
  onClose
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animate live Roadster preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle hover float & gentle pitch
      const hoverY = canvas.height / 2 + Math.sin(tick * 0.05) * 4;
      const pitch = Math.sin(tick * 0.04) * 0.08;

      PixelRenderer.drawRoadster(
        ctx,
        canvas.width / 2,
        hoverY,
        pitch,
        currentSkin,
        currentThruster,
        true, // fire thruster flame in preview
        false,
        0,
        false,
        tick
      );

      tick++;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [currentSkin, currentThruster]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="font-pixel text-base sm:text-lg text-white">
              ROADSTER HANGAR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Car Preview Canvas */}
        <div className="my-4 flex flex-col items-center justify-center bg-black/70 border border-cyan-900/60 rounded-lg p-4 relative overflow-hidden">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">
            SPECIFICATION PREVIEW
          </div>
          <canvas
            ref={previewCanvasRef}
            width={280}
            height={90}
            className="pixelated"
          />
          <div className="font-pixel text-sm text-white mt-1">
            {currentSkin.name}
          </div>
          <div className="text-xs text-slate-400 text-center max-w-md mt-0.5">
            {currentSkin.description}
          </div>
        </div>

        {/* Vehicle Skins Selection */}
        <div className="mb-5">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
            Vehicle Bodywork Skins
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SKINS.map((skin) => {
              const isUnlocked = highScore >= skin.unlockScore;
              const isSelected = currentSkin.id === skin.id;

              return (
                <button
                  key={skin.id}
                  onClick={() => isUnlocked && onSelectSkin(skin)}
                  disabled={!isUnlocked}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : isUnlocked
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-850 cursor-pointer'
                      : 'bg-slate-900/40 border-slate-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color dot */}
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: skin.bodyColor }}
                    />
                    <div>
                      <div className="font-pixel text-xs text-white">
                        {skin.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {isUnlocked
                          ? skin.unlockScore === 0
                            ? 'Default Unlocked'
                            : `Unlocked at ${skin.unlockScore} FT`
                          : `Requires ${skin.unlockScore} FT`}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="p-1 rounded-full bg-slate-800 text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thruster Plume Colors Selection */}
        <div className="mb-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
            SpaceX Thruster Gas Formulation
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {THRUSTER_COLORS.map((thruster) => {
              const isUnlocked = highScore >= thruster.unlockScore;
              const isSelected = currentThruster.id === thruster.id;

              return (
                <button
                  key={thruster.id}
                  onClick={() => isUnlocked && onSelectThruster(thruster)}
                  disabled={!isUnlocked}
                  className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : isUnlocked
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-600 cursor-pointer'
                      : 'bg-slate-900/40 border-slate-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-white/30 mb-1.5 flex items-center justify-center"
                    style={{ backgroundColor: thruster.outerColor }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: thruster.coreColor }}
                    />
                  </div>
                  <span className="font-pixel text-[10px] text-white truncate max-w-full">
                    {thruster.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {isUnlocked ? 'Ready' : `${thruster.unlockScore} FT`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Done button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xs rounded transition-all cursor-pointer"
          >
            CONFIRM CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
};
