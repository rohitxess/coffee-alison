'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password });
    // add your auth logic here
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'white',
      }}
    >
      {/* LEFT — Cover Image */}
      <div
        style={{
          flex: 1,
          display: 'none',
          backgroundImage: 'url(/images/login-cover.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="cover-image"
      />

      {/* RIGHT — Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          padding: '48px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '8px',
              }}
            >
              Login to your account
            </h1>
            <p style={{ color: '#71717a', fontSize: '14px' }}>
              Enter your email below to login to your account
            </p>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#71717a'}
                onBlur={(e)  => e.currentTarget.style.borderColor = '#27272a'}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                  Password
                </label>
                <a
                  href="#"
                  style={{
                    color: '#71717a',
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {e.currentTarget.style.color = 'white'}}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#71717a'}
                >
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#71717a'}
                onBlur={(e)  => e.currentTarget.style.borderColor = '#27272a'}
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                color: '#09090b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '4px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e4e4e7'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Login
            </button>

          </div>
        </div>
      </div>

      {/* Responsive — show cover image on large screens */}
      <style>{`
        @media (min-width: 768px) {
          .cover-image {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}