import React from 'react';

interface ShantiisanFooterProps {
  className?: string;
  showControlsTip?: boolean;
}

export const ShantiisanFooter: React.FC<ShantiisanFooterProps> = ({
  className = '',
  showControlsTip = true
}) => {
  return (
    <footer
      className={`w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-neutral-400 select-none ${className}`}
    >
      {/* Copyright text with official Republic of Shantiisan link */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-center sm:text-left leading-relaxed">
        <span>&copy; COPYRIGHT 2026</span>
        <a
          href="https://republic-of-shantiisan.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-300 hover:text-amber-300 transition-colors font-medium underline underline-offset-2 decoration-neutral-600 hover:decoration-amber-400 flex items-center gap-1"
          title="Republic of Shantiisan Official Portal"
        >
          <span className="text-amber-400 text-[10px]">&#9650;</span>
          PROPERTY OF THE REPUBLIC OF SHANTIISAN
        </a>
        <span className="hidden sm:inline">&middot;</span>
        <span>ALL RIGHTS RESERVED.</span>
      </div>

      {/* Japanese / Equipment ID Technical Spec */}
      <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
        <span className="font-kanji text-neutral-400">シャンティサン共和国</span>
        <span>[SPEC: SHNT-2026]</span>
      </div>
    </footer>
  );
};
