export function Footer() {
    return (
      <footer
        style={{
          width: '100%',
          backgroundColor: '#09090b',
          borderTop: '1px solid #27272a',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            color: '#71717a',
            fontSize: '14px',
            fontWeight: '500',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          Made with
          <span
            style={{
              display: 'inline-block',
              animation: 'heartbeat 1.2s ease-in-out infinite',
            }}
          >
            ❤️
          </span>
          and
          <span>☕</span>
          by <strong style={{ color: 'white' }}>Alison</strong>
        </p>
  
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.3); }
          }
        `}</style>
      </footer>
    );
  }