'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // add your auth logic here
    router.push('/home');  // ← redirect to home after login
  };

  // ... rest of your login page stays the same
}