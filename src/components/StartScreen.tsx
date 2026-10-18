import React, { useRef, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Skin } from '../types/game';
import { SKINS, PixelRenderer } from '../utils/pixelRenderer';
import { soundEngine } from '../utils/audio';
import { ShantiisanFooter } from './ui/ShantiisanFooter';
import { OptimusBot } from './ui/OptimusBot';

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
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handlePrevSkin = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextIdx = (currentSkinIndex - 1 + SKINS.length) % SKINS.length;
    onSelectSkin(SKINS[nextIdx]);
    soundEngine.playScore();
  };

  const handleNextSkin = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextIdx = (currentSkinIndex + 1) % SKINS.length;
    onSelectSkin(SKINS[nextIdx]);
    soundEngine.playScore();
  };

  // Touch swipe gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 25) {
      if (deltaX > 0) {
        handlePrevSkin();
      } else {
        handleNextSkin();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hoverY = canvas.height / 2 + Math.sin(tick * 0.06) * 3;
      const pitch = Math.sin(tick * 0.05) * 0.05;

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
      className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-6 bg-gradient-to-b from-black/60 via-black/35 to-black/85 select-none text-white overflow-hidden"
      style={{
        paddingTop: 'max(0.75rem, var(--sat))',
        paddingBottom: 'max(0.75rem, var(--sab))',
        paddingLeft: 'max(0.75rem, var(--sal))',
        paddingRight: 'max(0.75rem, var(--sar))'
      }}
    >
      {/* Top Technical Telemetry Header: Asymmetric Mecha-Industrial Header */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto pointer-events-auto border-b border-neutral-800/80 pb-2.5">
        {/* Brand & Japanese Department Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-600 shadow-[0_0_8px_rgba(232,33,39,0.8)]" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-oxanium font-bold text-xs uppercase tracking-widest text-white">
                TESLA x SPACEX
              </span>
              <span className="text-[9px] font-mono text-neutral-500 hidden sm:inline">
                [SYS-RDSTR-01]
              </span>
            </div>
            <span className="font-kanji text-[10px] text-neutral-400 tracking-wider">
              推進飛行実験装置 · 開発試作機
            </span>
          </div>
        </div>

        {/* Right: Best Record Display (Oversized Oxanium/Doto Numbers) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end bg-neutral-950/90 border border-neutral-800 px-3 py-1 shadow-lg">
            <span className="text-[9px] font-kanji text-neutral-400 uppercase tracking-widest">
              最高到達高度 / BEST
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-oxanium font-bold text-base sm:text-lg text-white tabular-nums tracking-tight">
                {highScore}
              </span>
              <span className="font-label text-[10px] text-red-400">FT</span>
            </div>
          </div>

          {/* Quick Mute Toggle Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 bg-neutral-950/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
          </button>
        </div>
      </header>

      {/* Main Center Section: Asymmetric Japanese Arcade Presentation */}
      <main className="flex flex-col items-center justify-center max-w-md w-full mx-auto my-auto text-center pointer-events-auto py-2">
        {/* Pixel Title Logo */}
        <div className="relative mb-2">
          <div className="absolute -top-3 left-0 font-kanji text-[10px] text-red-500 tracking-widest">
            極秘実験機体
          </div>
          <img
            src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
            alt="Flippy Roadster"
            className="h-16 sm:h-22 w-auto object-contain pixelated drop-shadow-[0_0_28px_rgba(232,33,39,0.55)]"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tristanvogt.com')) {
                target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
              }
            }}
          />
          <div className="absolute -bottom-2.5 right-0 font-mono text-[9px] text-neutral-500">
            [SPEC: TX-BOCA-2026]
          </div>
        </div>

        {/* Satirical Corporate Unveiling Subtitle */}
        <p className="font-mono text-neutral-400 text-[10px] sm:text-xs tracking-wider mb-4">
          TEXAS STARBASE UNVEILING · COLD-GAS PROPULSION
        </p>

        {/* Oversized Sharp Arcade LAUNCH Button */}
        <button
          type="button"
          onClick={onStartGame}
          className="w-full flex items-center justify-between bg-red-600 hover:bg-red-500 active:bg-red-700 text-white py-3.5 sm:py-4 px-6 border border-red-400 shadow-[0_0_35px_rgba(232,33,39,0.45)] cursor-pointer transition-all mb-4 group touch-manipulation"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-black/40 border border-white/20">
              <Play className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-left">
              <div className="font-oxanium font-bold text-lg sm:text-xl tracking-wider leading-none">
                LAUNCH
              </div>
              <div className="font-kanji text-[10px] text-red-200 tracking-widest mt-0.5">
                発進シーケンス開始
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-[10px] text-red-200/80">
            <div>[TAP OR SPACE]</div>
            <div className="font-kanji text-[9px]">準備完了</div>
          </div>
        </button>

        {/* Integrated Vehicle Selection Panel: Mecha-Industrial Cockpit */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full bg-neutral-950/95 border border-neutral-800 p-3 flex flex-col items-center shadow-2xl relative select-none"
        >
          {/* Technical Corner Registration Marks */}
          <div className="absolute -top-1 -left-1 text-[8px] text-neutral-600 font-mono">+</div>
          <div className="absolute -top-1 -right-1 text-[8px] text-neutral-600 font-mono">+</div>
          <div className="absolute -bottom-1 -left-1 text-[8px] text-neutral-600 font-mono">+</div>
          <div className="absolute -bottom-1 -right-1 text-[8px] text-neutral-600 font-mono">+</div>

          {/* Panel Header */}
          <div className="flex items-center justify-between w-full mb-1 pb-1 border-b border-neutral-800/80 text-[10px]">
            <div className="flex items-center gap-1.5 font-oxanium font-bold text-neutral-300 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-cyan-400" />
              <span>VEHICLE CHASSIS</span>
              <span className="font-kanji text-neutral-500 font-normal">機体選択</span>
            </div>
            <span className="font-mono text-neutral-500 text-[10px]">
              0{currentSkinIndex + 1} / 0{SKINS.length}
            </span>
          </div>

          {/* Vehicle Visual Stage & Controls */}
          <div className="flex items-center justify-between w-full gap-2 py-1">
            {/* Left Button: Sharp Arcade Pad */}
            <button
              type="button"
              onClick={handlePrevSkin}
              onTouchEnd={(e) => {
                e.preventDefault();
                handlePrevSkin();
              }}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700 text-white cursor-pointer transition-all touch-manipulation"
              aria-label="Previous Vehicle"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-300" />
            </button>

            {/* Vehicle Interactive Canvas Stage */}
            <div
              onClick={() => handleNextSkin()}
              className="flex-1 flex flex-col items-center justify-center py-1 px-2 cursor-pointer active:scale-98 transition-transform"
              title="Click or tap to cycle vehicle"
            >
              <canvas
                ref={previewCanvasRef}
                width={160}
                height={52}
                className="pixelated w-36 sm:w-44 h-auto"
              />
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-oxanium font-bold text-sm text-white tracking-wider">
                  {currentSkin.name}
                </span>
                <span className="text-[9px] font-mono text-neutral-500">
                  {currentSkin.id === 'ano_white' ? '[WHITE/GREY]' : ''}
                </span>
              </div>
            </div>

            {/* Right Button: Sharp Arcade Pad */}
            <button
              type="button"
              onClick={handleNextSkin}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNextSkin();
              }}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700 text-white cursor-pointer transition-all touch-manipulation"
              aria-label="Next Vehicle"
            >
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </button>
          </div>

          {/* Sharp Arcade Slot Stepper Dots */}
          <div className="flex items-center gap-1.5 mt-2">
            {SKINS.map((skin) => {
              const isCurrent = skin.id === currentSkin.id;
              return (
                <button
                  type="button"
                  key={skin.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSkin(skin);
                    soundEngine.playScore();
                  }}
                  title={skin.name}
                  className={`h-1.5 transition-all cursor-pointer touch-manipulation ${
                    isCurrent
                      ? 'w-6 bg-red-600 shadow-[0_0_8px_rgba(232,33,39,0.8)]'
                      : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                  }`}
                  aria-label={`Select ${skin.name}`}
                />
              );
            })}
          </div>

          {/* Optimus Ground Crew Coordinator */}
          <div className="w-full mt-2.5">
            <OptimusBot
              mood="idle"
              statusMessage="ALL 10 COLD-GAS JETS ARMED. NO DRIVERS REQUIRED."
              subMessage="OPTIMUS GEN-2 // STARBASE FLIGHT CHIEF"
              size="sm"
              compact={true}
            />
          </div>

          {/* Satirical Engineering Disclaimer */}
          <div className="mt-2 text-[9px] font-mono text-neutral-500 border-t border-neutral-900 pt-1.5 w-full text-center">
            &ldquo;EST. DELIVERY: Q4 2026... 2030 &middot; RESERVATION DEPOSIT: $250,000&rdquo;
          </div>
        </div>
      </main>

      {/* Bottom Technical Bar with Controls Tip & Shantiisan Official Copyright */}
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-2 pt-2 border-t border-neutral-800/80 pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-neutral-400 gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-kanji text-neutral-500">操縦法:</span>
            <span>[TAP / SPACE] = FLY &middot; [DOUBLE-TAP / B] = BARREL ROLL</span>
          </div>

          <div className="text-neutral-500 text-[9px] font-mono hidden sm:inline">
            FSD v14.9 (UNSUPERVISED... SORT OF)
          </div>
        </div>

        {/* Shantiisan Republic Copyright and TAV link */}
        <ShantiisanFooter />
      </div>
    </div>
  );
};
