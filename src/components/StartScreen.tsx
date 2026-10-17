import React from 'react';
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX, Lock, Check } from 'lucide-react';
import { Skin } from '../types/game';
import { SKINS, PixelRenderer } from '../utils/pixelRenderer';

interface StartScreenProps {
  onStartGame: () => void;
  highScore: number;
  currentSkin: Skin;
  onSelectSkin: (skin: Skin) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  highScore,
  currentSkin,
  onSelectSkin,
  isMuted,
  onToggleMute
}) => {
  const currentSkinIndex = SKINS.findIndex((s) => s.id === currentSkin.id);

  const handlePrevSkin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentSkinIndex - 1 + SKINS.length) % SKINS.length;
    const targetSkin = SKINS[nextIdx];
    if (highScore >= targetSkin.unlockScore) {
      onSelectSkin(targetSkin);
    }
  };

  const handleNextSkin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentSkinIndex + 1) % SKINS.length;
    const targetSkin = SKINS[nextIdx];
    if (highScore >= targetSkin.unlockScore) {
      onSelectSkin(targetSkin);
    }
  };

  const previewCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hoverY = canvas.height / 2 + Math.sin(tick * 0.06) * 3;
      const pitch = Math.sin(tick * 0.05) * 0.06;

      PixelRenderer.drawRoadster(
        ctx,
        canvas.width / 2,
        hoverY,
        pitch,
        currentSkin,
        {
          id: 'cryo_cyan',
          name: 'Cryo Cyan',
          coreColor: '#E0F7FF',
          outerColor: '#00D8FF',
          sparkColor: '#70E8FF',
          unlockScore: 0
        },
        true,
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
  }, [currentSkin]);

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 bg-black/60 backdrop-blur-[2px] select-none text-white overflow-hidden touch-none"
      style={{
        paddingTop: 'max(1rem, var(--sat))',
        paddingBottom: 'max(1rem, var(--sab))',
        paddingLeft: 'max(1rem, var(--sal))',
        paddingRight: 'max(1rem, var(--sar))'
      }}
    >
      {/* Top Bar: Clean Brand & High Score */}
      <div className="flex items-center justify-between max-w-xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-600">
            <path d="M12 2C8.5 2 5.5 3 3 5l2 3c2-1.5 4.5-2.2 7-2.2s5 .7 7 2.2l2-3C18.5 3 15.5 2 12 2zm0 6c-2 0-3.8.5-5.3 1.5L8 12.2c1.2-.8 2.6-1.2 4-1.2s2.8.4 4 1.2l1.3-2.7C15.8 8.5 14 8 12 8zm-1 6v8h2v-8h-2z" />
          </svg>
          <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-slate-300">
            Tesla x SpaceX
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-3 py-1 rounded-full text-xs font-mono">
          <span className="text-slate-400 text-[10px]">BEST:</span>
          <span className="text-cyan-400 font-bold font-pixel text-xs">{highScore} FT</span>
        </div>
      </div>

      {/* Main Center Action Card */}
      <div className="flex flex-col items-center justify-center max-w-sm w-full mx-auto my-auto text-center">
        {/* Pixel Logo */}
        <div className="mb-3">
          <img
            src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
            alt="Flippy Roadster"
            className="h-16 sm:h-20 w-auto object-contain pixelated drop-shadow-[0_0_20px_rgba(232,33,39,0.5)]"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tristanvogt.com')) {
                target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
              }
            }}
          />
        </div>

        <p className="font-retro text-cyan-300 text-xs tracking-widest mb-6">
          HOP TO 2028 · SPACEX PACKAGE
        </p>

        {/* Big Touch-Friendly Launch Button */}
        <button
          onClick={onStartGame}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white py-4 px-8 rounded-xl border-2 border-red-400 font-pixel text-sm sm:text-base shadow-[0_0_25px_rgba(232,33,39,0.55)] cursor-pointer transition-all mb-5 animate-pulse"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>LAUNCH</span>
        </button>

        {/* Inline Vehicle Carousel */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
            SELECT VEHICLE
          </div>

          <div className="flex items-center justify-between w-full">
            <button
              onClick={handlePrevSkin}
              className="p-2 rounded-lg bg-black/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous Skin"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <canvas
                ref={previewCanvasRef}
                width={160}
                height={52}
                className="pixelated"
              />
              <span className="font-pixel text-xs text-white mt-1">
                {currentSkin.name}
              </span>
            </div>

            <button
              onClick={handleNextSkin}
              className="p-2 rounded-lg bg-black/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Next Skin"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Skin Dots / Unlock status */}
          <div className="flex items-center gap-1.5 mt-2">
            {SKINS.map((skin) => {
              const isUnlocked = highScore >= skin.unlockScore;
              const isCurrent = skin.id === currentSkin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => isUnlocked && onSelectSkin(skin)}
                  disabled={!isUnlocked}
                  title={`${skin.name}${!isUnlocked ? ` (Reach ${skin.unlockScore} FT)` : ''}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'w-6 bg-cyan-400'
                      : isUnlocked
                      ? 'w-2 bg-slate-600 hover:bg-slate-400'
                      : 'w-2 bg-red-900/60 opacity-50'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Minimal Footer: Simple Audio Toggle & Quick Controls Tip */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
        <div className="text-[11px] text-slate-300 flex items-center gap-2">
          <span className="hidden sm:inline">Controls:</span>
          <span>Tap to Fly · Double-Tap or [B] to Roll</span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span className="text-[10px] hidden sm:inline">{isMuted ? 'MUTED' : 'SOUND'}</span>
        </button>
      </div>
    </div>
  );
};
