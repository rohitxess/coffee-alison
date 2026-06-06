'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navLinks = [
  { label: '🏠 Home',   href: '/home' },
  { label: '☕ Coffee', href: '/coffee' },
  { label: '👤 Profile', href: '#' },
  { label: '⚙️ Settings', href: '#' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        width: '240px',
        backgroundColor: '#09090b',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: '8px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          color: 'white',
          fontWeight: '800',
          fontSize: '18px',
          padding: '12px 8px',
          marginBottom: '16px',
          borderBottom: '1px solid #27272a',
        }}
      >
        ☕ Coffee with Alison
      </div>

      {/* Nav Links */}
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            display: 'block',
            padding: '10px 12px',
            borderRadius: '8px',
            color: pathname === link.href ? 'white' : '#71717a',
            backgroundColor: pathname === link.href ? '#27272a' : 'transparent',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (pathname !== link.href) {
              e.currentTarget.style.backgroundColor = '#18181b';
              e.currentTarget.style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== link.href) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#71717a';
            }
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}