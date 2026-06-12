'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/ui/card';
import { Button, NoButton } from '@/ui/button';

type AnswerType = 'yes' | 'ofcourse' | 'annoying' | 'no' | null;

const gifs = [
  '/images/gify1.gif',  '/images/gify2.gif',  '/images/gify3.gif',
  '/images/gify4.gif',  '/images/gify5.gif',  '/images/gify6.gif',
  '/images/gify7.gif',  '/images/gify8.gif',  '/images/gify9.gif',
  '/images/gify10.gif', '/images/gify11.gif', '/images/gify12.gif',
  '/images/gify13.gif',
];

const responses: Record<NonNullable<AnswerType>, { emoji: string; message: string; image: string }> = {
  yes:      { emoji: '☕', message: "Yay! Coffee time!",                              image: '/images/yes.png' },
  ofcourse: { emoji: '',   message: "OBVIOUSLY!",                                      image: '/images/hahadoggy.png' },
  annoying: { emoji: '',   message: "I'll take it as a compliment",                   image: '/images/oops.png' },
  no:       { emoji: '😏', message: "Nice try. You literally can't say no to coffee.", image: '/images/no.png' },
};

export default function CoffeePage() {
  const [answer, setAnswer]   = useState<AnswerType>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const saveToFirebase = async (ans: string) => {
    try {
      await addDoc(collection(db, 'responses'), {
        answer: ans,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('Firebase error:', e);
    }
  };

  const handleClick = (ans: AnswerType) => {
    if (!ans) return;
    setAnswer(ans);
    saveToFirebase(ans).catch(console.error);
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: ans }),
    }).catch(console.error);
  };

  const reset = () => setAnswer(null);

  if (!mounted) return null;

  return (
    <div
      style={{
        height: '100%',               // ← fills layout's main area
        width: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',           // ← no scroll
        boxSizing: 'border-box',
      }}
    >
      {/* Marquee — fixed height */}
      <div style={{ width: '100%', overflow: 'hidden', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            animation: 'marquee 60s linear infinite',
            width: 'max-content',
            padding: '12px 0',
          }}
        >
          {[...gifs, ...gifs].map((gif, i) => (
            <img
              key={i}
              src={gif}
              alt={`gif-${i}`}
              style={{
                height: '100px',       // ← smaller to save vertical space
                width: '100px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '2px solid #d1d5db',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Centered content — fills remaining space */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',   // ← centers vertically in remaining space
          width: '100%',
          padding: '0 16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>☕</span>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              fontWeight: '900',
              backgroundImage: 'linear-gradient(135deg, #c87a20 0%, #a05020 50%, #6b3010 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}
          >
            Coffee with Alison
          </h1>
          <span style={{ fontSize: '1.8rem' }}>☕</span>
        </header>

        {/* Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            boxSizing: 'border-box',
          }}
        >
          <Card
            question="Coffee Shawttyy?"
            answer={answer}
            response={answer ? responses[answer] : undefined}
            onReset={reset}
          >
            <Button variant="yes" onClick={() => handleClick('yes')}>Yes</Button>
            <NoButton />
            <Button variant="ofcourse" onClick={() => handleClick('ofcourse')}>Of course Yes</Button>
            <Button variant="annoying" onClick={() => handleClick('annoying')}>Yes, but you are annoying</Button>
          </Card>
        </div>
        
        {/* custom reponse sent to the phone */}

        <div
       className="relative z-10 rounded-3xl p-8"
       style={{
         backgroundColor: 'white',
         border: '2px solid #d1d5db',   
         borderRadius: '24px',          
         boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
       }}
        >
          <input type="text" placeholder='Enter your reponse here' />
        </div>
        <>
        <button>Send</button>
        </>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}