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
  yes: `py-3 px-4 rounded-xl font-bold text-white text-sm
    bg-gradient-to-br from-amber-500 to-amber-700
    hover:from-amber-400 hover:to-amber-600
    hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/40
    active:translate-y-0 transition-all duration-150`,

  ofcourse: `py-3 px-4 rounded-xl font-bold text-amber-900 text-sm
    bg-gradient-to-br from-yellow-300 to-amber-400
    hover:from-yellow-200 hover:to-amber-300
    hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/30
    active:translate-y-0 transition-all duration-150`,

  annoying: `py-3 px-4 rounded-xl font-bold text-zinc-500 text-xs
    border border-zinc-700/50 bg-transparent
    hover:border-orange-800/60 hover:text-orange-400/70 hover:bg-orange-950/20
    active:translate-y-0 transition-all duration-150`,

  no: `py-3 px-4 rounded-xl font-bold text-zinc-400 text-sm
    bg-zinc-800/80 border border-zinc-600/40
    hover:bg-zinc-700/80 hover:text-zinc-300
    transition-colors duration-75 cursor-not-allowed select-none`,
};

export function NoButton() {
  const noRef = useRef<HTMLButtonElement>(null);

  const runAway = useCallback(() => {
    const btn = noRef.current;
    if (!btn) return;
  
    // Move to body so position:fixed is always relative to the viewport
    if (btn.parentElement !== document.body) {
      document.body.appendChild(btn);
    }
  
    btn.style.position = 'fixed';
    btn.style.zIndex   = '9999';
    btn.style.margin   = '0'; // kill any inherited margin
  
    const PADDING  = 20;
    const btnWidth  = btn.offsetWidth;
    const btnHeight = btn.offsetHeight;
  
    const maxX = window.innerWidth  - btnWidth  - PADDING;
    const maxY = window.innerHeight - btnHeight - PADDING;
  
    // Clamp both axes so it can never go off-screen
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
  
    btn.style.left = `${Math.max(PADDING, Math.min(randomX, maxX))}px`;
    btn.style.top  = `${Math.max(PADDING, Math.min(randomY, maxY))}px`;
  }, []);

  return (
    <button
      ref={noRef}
      onMouseEnter={runAway}
      className={variantStyles.no}
      style={{ transition: 'left 0.06s, top 0.06s, background 0.15s' }}
    >
      ❌ No
    </button>
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