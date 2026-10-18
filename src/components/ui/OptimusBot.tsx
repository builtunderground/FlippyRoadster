import React, { useRef, useEffect } from 'react';
import { PixelRenderer } from '../../utils/pixelRenderer';

interface OptimusBotProps {
  mood?: 'idle' | 'cheer' | 'wrench' | 'alert';
  statusMessage?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  className?: string;
  onInteract?: () => void;
}

export const OptimusBot: React.FC<OptimusBotProps> = ({
  mood = 'idle',
  statusMessage = 'ACTUATORS CALIBRATED. ALL SYSTEMS NOMINAL.',
  subMessage = 'OPTIMUS GEN-2 // UNIT 042 // PIT CHIEF',
  size = 'md',
  compact = false,
  className = '',
  onInteract
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const scale = size === 'sm' ? 0.9 : size === 'lg' ? 1.4 : 1.15;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      PixelRenderer.drawOptimus(
        ctx,
        canvas.width / 2,
        canvas.height - 24 * scale,
        tick,
        mood,
        scale
      );
      tick++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [mood, size]);

  const canvasDims =
    size === 'sm'
      ? { width: 56, height: 60 }
      : size === 'lg'
      ? { width: 90, height: 96 }
      : { width: 72, height: 76 };

  if (compact) {
    return (
      <div
        onClick={onInteract}
        className={`inline-flex items-center gap-2 bg-neutral-950/90 border border-neutral-800 px-2.5 py-1 ${
          onInteract ? 'cursor-pointer hover:border-cyan-500/50' : ''
        } ${className}`}
        title="Tesla Optimus Gen-2 Pit Crew"
      >
        <canvas
          ref={canvasRef}
          width={canvasDims.width}
          height={canvasDims.height}
          className="pixelated shrink-0"
        />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                mood === 'alert'
                  ? 'bg-red-500 animate-ping'
                  : mood === 'cheer'
                  ? 'bg-emerald-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span className="font-oxanium font-bold text-[10px] text-white tracking-wider">
              OPTIMUS GEN-2
            </span>
          </div>
          <span className="font-mono text-[9px] text-neutral-400 max-w-[190px] truncate">
            {statusMessage}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onInteract}
      className={`relative flex items-center gap-3 bg-black/90 border border-neutral-800/90 p-2.5 shadow-xl select-none ${
        onInteract ? 'cursor-pointer hover:border-cyan-500/60' : ''
      } ${className}`}
    >
      {/* Corner Tech Marks */}
      <div className="absolute top-0.5 left-1 font-mono text-[7px] text-neutral-600">
        ⌜ TSLA-BOT ⌝
      </div>
      <div className="absolute top-0.5 right-1 font-mono text-[7px] text-neutral-600">
        ⌞ OPT-042 ⌟
      </div>

      <div className="shrink-0 flex items-center justify-center bg-neutral-950 border border-neutral-800 p-0.5">
        <canvas
          ref={canvasRef}
          width={canvasDims.width}
          height={canvasDims.height}
          className="pixelated"
        />
      </div>

      <div className="flex flex-col text-left justify-center flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div
            className={`w-1.5 h-1.5 ${
              mood === 'alert'
                ? 'bg-red-500 animate-pulse'
                : mood === 'cheer'
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                : 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
            }`}
          />
          <span className="font-oxanium font-bold text-[10px] sm:text-xs text-white uppercase tracking-wider">
            {subMessage}
          </span>
        </div>
        <p className="font-mono text-[9px] sm:text-[10px] text-neutral-300 leading-snug">
          &ldquo;{statusMessage}&rdquo;
        </p>
        <span className="font-kanji text-[8px] text-neutral-500 mt-0.5">
          テスラ·オプティマス ロボット管制支援
        </span>
      </div>
    </div>
  );
};
