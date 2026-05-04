'use client';

import { useRef, useCallback } from 'react';

type ButtonVariant = 'yes' | 'ofcourse' | 'annoying' | 'no';

interface ButtonProps {
  variant: ButtonVariant;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  yes: `w-full py-3 px-4 rounded-xl font-bold text-white text-sm
    bg-green-500
    border-2 border-green-700
    hover:bg-green-400
    hover:-translate-y-1 hover:shadow-lg
    active:translate-y-0 transition-all duration-150`,

  ofcourse: `w-full py-3 px-4 rounded-xl font-bold text-white text-sm
    bg-amber-500
    border-2 border-amber-700
    hover:bg-amber-400
    hover:-translate-y-1 hover:shadow-lg
    active:translate-y-0 transition-all duration-150`,

  annoying: `w-full py-3 px-4 rounded-xl font-bold text-white text-xs
    bg-orange-500
    border-2 border-orange-700
    hover:bg-orange-400
    hover:-translate-y-1 hover:shadow-lg
    active:translate-y-0 transition-all duration-150`,

  no: `w-full py-3 px-4 rounded-xl font-bold text-white text-sm
    bg-gray-500
    border-2 border-gray-700
    cursor-not-allowed select-none`,
};

export function NoButton() {
  const noRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const runAway = useCallback(() => {
    const btn = noRef.current;
    if (!btn) return;

    const PADDING   = 20;
    const btnWidth  = btn.offsetWidth;
    const btnHeight = btn.offsetHeight;

    const maxX = window.innerWidth  - btnWidth  - PADDING;
    const maxY = window.innerHeight - btnHeight - PADDING;

    // Keep button in DOM where it is — just move visually with fixed position
    btn.style.position = 'fixed';
    btn.style.zIndex   = '9999';
    btn.style.width    = `${btnWidth}px`;
    btn.style.left     = `${Math.max(PADDING, Math.floor(Math.random() * maxX))}px`;
    btn.style.top      = `${Math.max(PADDING, Math.floor(Math.random() * maxY))}px`;
  }, []);

  return (
    // Placeholder div keeps the grid space reserved
    <div ref={containerRef} className="w-full">
      <button
        ref={noRef}
        onMouseEnter={runAway}
        className={variantStyles.no}
        style={{ transition: 'left 0.08s ease, top 0.08s ease' }}
      >
        😝 No
      </button>
    </div>
  );
}

export function Button({ variant, onClick, children, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantStyles[variant]} disabled:opacity-50`}
    >
      {children}
    </button>
  );
}