import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface ArcadeInitialsInputProps {
  initialValue?: string;
  onSubmit: (initials: string) => void;
  disabled?: boolean;
  score?: number;
}

const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!*?'.split('');

export const ArcadeInitialsInput: React.FC<ArcadeInitialsInputProps> = ({
  initialValue = 'AAA',
  onSubmit,
  disabled = false,
  score
}) => {
  const [letters, setLetters] = useState<string[]>(() => {
    const clean = (initialValue || 'AAA').toUpperCase().slice(0, 3).padEnd(3, 'A');
    return clean.split('');
  });
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const cycleLetter = (slotIndex: number, direction: 'up' | 'down') => {
    soundEngine.playScore();
    setLetters((prev) => {
      const copy = [...prev];
      const cur = copy[slotIndex];
      const curIdx = CHAR_SET.indexOf(cur);
      let nextIdx = direction === 'up' ? curIdx + 1 : curIdx - 1;
      if (nextIdx < 0) nextIdx = CHAR_SET.length - 1;
      if (nextIdx >= CHAR_SET.length) nextIdx = 0;
      copy[slotIndex] = CHAR_SET[nextIdx];
      return copy;
    });
    setActiveSlot(slotIndex);
  };

  const setSlotChar = (slotIndex: number, char: string) => {
    soundEngine.playScore();
    setLetters((prev) => {
      const copy = [...prev];
      copy[slotIndex] = char.toUpperCase();
      return copy;
    });
    if (slotIndex < 2) {
      setActiveSlot(slotIndex + 1);
    }
  };

  // Keyboard navigation & typing listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        cycleLetter(activeSlot, 'up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        cycleLetter(activeSlot, 'down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSlot((prev) => (prev > 0 ? prev - 1 : 2));
        soundEngine.playScore();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveSlot((prev) => (prev < 2 ? prev + 1 : 0));
        soundEngine.playScore();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setSlotChar(activeSlot, 'A');
        if (activeSlot > 0) setActiveSlot(activeSlot - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        setSlotChar(activeSlot, e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlot, disabled, letters]);

  const handleSubmit = () => {
    const initials = letters.join('').toUpperCase();
    soundEngine.playPickup();
    onSubmit(initials);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center p-3.5 bg-black border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] max-w-sm w-full select-none"
    >
      {/* Arcade Header Title */}
      <div className="flex items-center gap-1.5 text-[10px] font-oxanium font-bold tracking-widest text-amber-400 uppercase mb-1">
        <span className="w-1.5 h-1.5 bg-amber-400 animate-ping" />
        <span>ENTER PILOT INITIALS</span>
        <span className="font-kanji text-[9px] text-amber-500">パイロット登録</span>
      </div>

      <div className="text-[9px] font-mono text-neutral-400 mb-2 text-center">
        USE ARROWS OR KEYBOARD TO REGISTER YOUR 3-LETTER CALLSIGN
      </div>

      {score !== undefined && (
        <div className="mb-2 font-mono text-[10px] text-neutral-300 bg-neutral-950 border border-neutral-800 px-3 py-0.5">
          SCORE: <span className="text-amber-400 font-bold font-oxanium">{score} FT</span>
        </div>
      )}

      {/* 3 Arcade Letter Slots */}
      <div className="flex items-center justify-center gap-3 my-1">
        {[0, 1, 2].map((slotIdx) => {
          const isActive = activeSlot === slotIdx;
          const letter = letters[slotIdx];

          return (
            <div key={slotIdx} className="flex flex-col items-center">
              {/* Stepper Up Button */}
              <button
                type="button"
                onClick={() => cycleLetter(slotIdx, 'up')}
                className="w-11 h-7 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-amber-400 border border-neutral-800 hover:border-amber-500/60 flex items-center justify-center cursor-pointer transition-all mb-1 touch-manipulation"
                aria-label={`Cycle letter ${slotIdx + 1} up`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* Central Letter Display */}
              <div
                onClick={() => setActiveSlot(slotIdx)}
                className={`w-12 h-14 bg-neutral-950 border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isActive
                    ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.6)] scale-105'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span className="font-doto text-3xl sm:text-4xl font-black text-white tabular-nums tracking-wider leading-none">
                  {letter}
                </span>
              </div>

              {/* Stepper Down Button */}
              <button
                type="button"
                onClick={() => cycleLetter(slotIdx, 'down')}
                className="w-11 h-7 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-amber-400 border border-neutral-800 hover:border-amber-500/60 flex items-center justify-center cursor-pointer transition-all mt-1 touch-manipulation"
                aria-label={`Cycle letter ${slotIdx + 1} down`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full mt-3 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-oxanium font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer transition-all touch-manipulation"
      >
        <Check className="w-4 h-4 stroke-[3]" />
        <span>CONFIRM INITIALS: [{letters.join('')}]</span>
      </button>
    </div>
  );
};
