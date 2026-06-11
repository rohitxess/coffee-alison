'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors]     = useState<{  
    email?: string[];
    password?: string[];
    general?: string[];
  }>({});
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        console.log('⌨️ Enter key pressed!');
        handleLogin();
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mounted, email, password]);

  useEffect(() => { setMounted(true); }, []);

  
  useEffect(() => {
    if (!mounted) return;

    const loginButton = document.getElementById('login-button');
    if (!loginButton) return;

    const handleLoginClick = (e: Event) => {
      e.preventDefault();
      console.log('🔑 Login button clicked!');
      handleLogin();
    };

    loginButton.addEventListener('click', handleLoginClick);

    // Cleanup on unmount
    return () => {
      loginButton.removeEventListener('click', handleLoginClick);
    };
  }, [mounted, email, password]); // ← re-registers when email/password changes

  const handleLogin = () => {
    setErrors({});
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);

    // Basic validation
    if (!email) {
      setErrors((prev) => ({ ...prev, email: ['Email is required'] }));
      return;
    }

    if (!password) {
      setErrors((prev) => ({ ...prev, password: ['Password is required'] }));
      return;
    }

    if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: ['Password must be at least 6 characters'] }));
      return;
    }

    // Navigate to home
    router.push('/home');
  };

  if (!mounted) return null;

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
<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <label style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
      Password
    </label>
    <a
      href="#"
      style={{ color: '#71717a', fontSize: '13px', textDecoration: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; }}
    >
      Forgot your password?
    </a>
  </div>

  {/* Input wrapper */}
  <div style={{ position: 'relative' }}>
    <input
      type={showPassword ? 'text' : 'password'}  
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={{
        backgroundColor: '#0a0a0a',
        border: `1px solid ${errors.password ? '#ef4444' : '#27272a'}`,
        borderRadius: '8px',
        padding: '12px 40px 12px 14px',  
        color: 'white',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#71717a'; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#27272a'; }}
    />

    {/* Eye Icon */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#71717a',
        display: 'flex',
        alignItems: 'center',
        padding: '0',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; }}
    >
      {showPassword ? (
        // Eye Off — password visible
        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      ) : (
        // Eye — password hidden
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  </div>

  {/* Password error */}
  {errors.password && (
    <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>
      {errors.password[0]}
    </p>
  )}
</div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              id="login-button"
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