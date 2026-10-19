import React, { useRef, useEffect } from 'react';
import { X, Lock, Check, Sparkles } from 'lucide-react';
import { Skin, ThrusterColor } from '../types/game';
import { SKINS, THRUSTER_COLORS, PixelRenderer } from '../utils/pixelRenderer';
import { GameLogo } from './ui/GameLogo';
import { OptimusBot } from './ui/OptimusBot';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#050505] border border-neutral-800 max-w-2xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-y-auto relative">
        {/* Technical Corner Registration Marks */}
        <div className="absolute top-1 left-1 font-mono text-[9px] text-neutral-600">⌜ HANGAR-01 ⌝</div>
        <div className="absolute top-1 right-1 font-mono text-[9px] text-neutral-600">⌞ SEC-09 ⌟</div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <GameLogo size="xs" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-oxanium font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                  ROADSTER HANGAR
                </h2>
                <span className="font-mono text-[9px] text-neutral-500">[BAY-04]</span>
              </div>
              <div className="font-kanji text-[10px] text-neutral-400">
                機体格納庫 · 仕様設定
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

        {/* Live Car Preview Stage */}
        <div className="my-3 flex flex-col items-center justify-center bg-black border border-neutral-800 p-3 sm:p-4 relative">
          <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span>[CHASSIS TELEMETRY]</span>
            <span className="font-kanji text-neutral-400">実機プレビュー</span>
          </div>
          <canvas
            ref={previewCanvasRef}
            width={280}
            height={90}
            className="pixelated"
          />
          <div className="font-oxanium font-bold text-sm text-white mt-1 uppercase tracking-wider">
            {currentSkin.name}
          </div>
          <div className="text-[11px] font-mono text-neutral-400 text-center max-w-md mt-0.5">
            {currentSkin.description}
          </div>

          {/* Optimus Pit Crew Chief */}
          <div className="w-full mt-3">
            <OptimusBot
              mood="wrench"
              statusMessage="COLD-GAS AIR JETS & MAGNETS SECURED. CHASSIS RIGIDITY 100%."
              subMessage="OPTIMUS GEN-2 // PIT CREW CHIEF"
              size="sm"
              compact={true}
            />
          </div>
        </div>

        {/* Vehicle Skins Selection */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-neutral-900">
            <div className="text-[10px] font-oxanium font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-600" />
              <span>VEHICLE BODYWORK SKINS</span>
            </div>
            <span className="font-kanji text-[10px] text-neutral-500">車体外装</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SKINS.map((skin) => {
              const isUnlocked = highScore >= skin.unlockScore;
              const isSelected = currentSkin.id === skin.id;

              return (
                <button
                  key={skin.id}
                  onClick={() => isUnlocked && onSelectSkin(skin)}
                  disabled={!isUnlocked}
                  className={`flex items-center justify-between p-2.5 border text-left transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-red-500 shadow-[0_0_12px_rgba(232,33,39,0.3)]'
                      : isUnlocked
                      ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 cursor-pointer'
                      : 'bg-neutral-950/40 border-neutral-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Color dot */}
                    <div
                      className="w-3.5 h-3.5 border border-white/20 shrink-0"
                      style={{ backgroundColor: skin.bodyColor }}
                    />
                    <div>
                      <div className="font-oxanium font-bold text-xs text-white">
                        {skin.name}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-400">
                        {isUnlocked
                          ? skin.unlockScore === 0
                            ? 'Default Factory Spec'
                            : `Unlocked at ${skin.unlockScore} FT`
                          : `Requires ${skin.unlockScore} FT`}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="p-0.5 bg-red-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="text-neutral-600">
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
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-neutral-900">
            <div className="text-[10px] font-oxanium font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400" />
              <span>SPACEX COLD-GAS FORMULATION</span>
            </div>
            <span className="font-kanji text-[10px] text-neutral-500">推進剤成分</span>
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
                  className={`flex flex-col items-center p-2 border text-center transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : isUnlocked
                      ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 cursor-pointer'
                      : 'bg-neutral-950/40 border-neutral-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="w-5 h-5 border border-white/20 mb-1.5 flex items-center justify-center"
                    style={{ backgroundColor: thruster.outerColor }}
                  >
                    <div
                      className="w-2 h-2"
                      style={{ backgroundColor: thruster.coreColor }}
                    />
                  </div>
                  <span className="font-oxanium font-bold text-[10px] text-white truncate max-w-full">
                    {thruster.name}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                    {isUnlocked ? 'Ready' : `${thruster.unlockScore} FT`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Done button */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-oxanium font-bold text-xs border border-red-400 transition-all cursor-pointer tracking-wider"
          >
            CONFIRM CONFIGURATION &middot; 確定
          </button>
        </div>
      </div>
    </div>
  );
};
