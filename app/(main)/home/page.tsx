'use client';

import { useRouter } from 'next/navigation';

const cards = [
  { emoji: '☕', title: 'Coffee this week?',  desc: 'Let Alison know if you want coffee!',  color: '#fef3c7', border: '#f59e0b' },
  { emoji: '📅', title: 'Last meetup',        desc: 'You last had coffee 3 days ago.',       color: '#ede9fe', border: '#8b5cf6' },
  { emoji: '💬', title: 'Responses',          desc: 'You have responded 5 times so far.',    color: '#dcfce7', border: '#22c55e' },
  { emoji: '❤️', title: 'Made with love',     desc: 'This app was made just for you!',       color: '#ffe4e6', border: '#f43f5e' },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#09090b', margin: 0 }}>
          Welcome back! 👋
        </h1>
        <p style={{ color: '#71717a', fontSize: '15px', marginTop: '6px' }}>
          Here's what's happening with your coffee plans.
        </p>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: card.color,
              border: `2px solid ${card.border}`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '32px' }}>{card.emoji}</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#09090b', margin: 0 }}>
              {card.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Go to Coffee Button */}
      <button
        onClick={() => router.push('/coffee')}
        style={{
          backgroundColor: '#09090b',
          color: 'white',
          border: '2px solid #09090b',
          borderRadius: '12px',
          padding: '14px 32px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
      >
        ☕ Go to Coffee Page
      </button>
    </div>
  );
}