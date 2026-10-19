import React from 'react';

export const TavLogo: React.FC<{ className?: string }> = ({ className = 'h-2.5 w-auto' }) => (
  <svg
    viewBox="0 0 7 2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
    style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    aria-label="TAV Logo"
  >
    <rect x="0" y="0" width="3" height="1" fill="#E82127" />
    <rect x="1" y="1" width="1" height="1" fill="#E82127" />
    <rect x="3" y="1" width="1" height="1" fill="#E82127" />
    <rect x="4" y="0" width="1" height="1" fill="#E82127" />
    <rect x="5" y="1" width="1" height="1" fill="#E82127" />
    <rect x="6" y="0" width="1" height="1" fill="#E82127" />
  </svg>
);

interface ShantiisanFooterProps {
  className?: string;
  showControlsTip?: boolean;
}

export const ShantiisanFooter: React.FC<ShantiisanFooterProps> = ({
  className = ''
}) => {
  return (
    <footer
      className={`w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-neutral-400 select-none ${className}`}
    >
      {/* Copyright text with small TAV logo and Property of the Republic of Shantiisan */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-center sm:text-left leading-relaxed">
        <span>&copy; Copyright 2026 Tristan Alain Vogt, All rights reserved.</span>
        <a
          href="https://www.tristanvogt.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center align-middle hover:opacity-80 transition-opacity cursor-pointer mx-0.5"
          title="Tristan Alain Vogt — https://www.tristanvogt.com/"
        >
          <TavLogo className="h-2.5 w-auto" />
        </a>
        <span className="hidden sm:inline">&middot;</span>
        <a
          href="https://republic-of-shantiisan.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-300 hover:text-amber-300 transition-colors underline underline-offset-2 decoration-neutral-700 hover:decoration-amber-400"
          title="Republic of Shantiisan Official Portal"
        >
          Property of the Republic of Shantiisan
        </a>
      </div>

      {/* Equipment Spec - streamlined */}
      <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
        <span className="font-kanji text-neutral-400">シャンティサン共和国</span>
        <span>[SPEC: SHNT-2026]</span>
      </div>
    </footer>
  );
};
