'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const router                  = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/home');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        margin: 0,
        padding: 0,
      }}
    >
      {/* LEFT — Cover Image */}
      <div
        className="cover-image"
        style={{
          flex: 1,
          backgroundImage: 'url(/images/login-cover.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'none',
        }}
      />

      {/*Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          padding: '48px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h1
              style={{
                color: 'white',
                fontSize: '26px',
                fontWeight: '700',
                margin: '0 0 8px 0',
              }}
            >
              Login to your account
            </h1>
            <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>
              Enter your email below to login to your account
            </p>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#71717a'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#27272a'; }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <label
                  style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Password
                </label>
                <a
                 href="#"
                  style={{
                    color: '#71717a',
                    fontSize: '13px',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; }}
                >
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#71717a'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#27272a'; }}
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '4px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e4e4e7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              Login
            </button>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '4px 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#27272a' }} />
              <span style={{ color: '#52525b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                OR CONTINUE WITH
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#27272a' }} />
            </div>

            {/* Google Button */}
            <button
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#18181b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Sign up link */}
            <p style={{ textAlign: 'center', color: '#71717a', fontSize: '13px', margin: 0 }}>
              Don't have an account?{' '}
              <a
                href="#"
                style={{ color: 'white', textDecoration: 'underline', fontWeight: '500' }}
              >
                Sign up
              </a>
            </p>

          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (min-width: 768px) {
          .cover-image {
            display: block !important;
          }
        }
        input::placeholder {
          color: #52525b;
        }
      `}</style>
    </div>
  );
}