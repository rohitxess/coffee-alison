'use client';

interface ToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export function Toggle({ isOpen, onToggle, style }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        width: '36px',
        height: '36px',
        transition: 'all 0.25s ease',
        flexShrink: 0,
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#18181b'; }}
    >
      {isOpen ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </button>
  );
}