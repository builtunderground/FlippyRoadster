import React from 'react';

interface GameLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const GameLogo: React.FC<GameLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    xs: 'h-6 sm:h-8',
    sm: 'h-9 sm:h-12',
    md: 'h-12 sm:h-16',
    lg: 'h-20 sm:h-28',
    xl: 'h-24 sm:h-36'
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/FlippyRoadster-PixelLogo.png`}
        alt="Flippy Roadster Logo"
        className={`${sizeClasses[size]} w-auto object-contain pixelated drop-shadow-[0_0_24px_rgba(232,33,39,0.55)] transition-transform hover:scale-[1.02]`}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('tristanvogt.com')) {
            target.src = 'https://tristanvogt.com/flippycar/FlippyRoadster-PixelLogo.png';
          }
        }}
      />
      {showSubtitle && (
        <span className="font-kanji text-[9px] text-red-500 tracking-widest uppercase mt-0.5">
          極秘実験機体 · FLIPPY ROADSTER
        </span>
      )}
    </div>
  );
};
