'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/ui/card';
import { Button, NoButton } from '@/ui/button';

type AnswerType = 'yes' | 'ofcourse' | 'annoying' | 'no' | null;

const responses: Record<NonNullable<AnswerType>, { emoji: string; message: string, image: string }> = {
  yes:      { 
    emoji: '☕',
    message: "Yay! Coffee time!" ,
    image: '/images/yes.png',
  },
  ofcourse: {
    emoji: '', 
    message: "OBVIOUSLY!",
    image: '/images/hahadoggy.png',
  },
  annoying: { 
    emoji: '',
    message: "I'll take it as a compliment",
    image: '/images/oops.png',
  },
  no:{ 
    emoji: '😏', 
    message: "Nice try. You literally can't say no to coffee.",
    image: '/images/no.png',
    },
};

export default function Home() {
  const [answer, setAnswer]     = useState<AnswerType>(null);
  // const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const noRef                   = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const saveToFirebase = async (ans: string) => {
    try {
      const docRef = await addDoc(collection(db, 'responses'), {
        answer: ans,
        createdAt: serverTimestamp(),
      });
      console.log('Saved to Firebase with ID:', docRef.id);
    } catch (e) {
      console.error('Firebase error:', e);
    }
  };

  // const handleClick = async (ans: AnswerType) => {
  //   if (!ans || loading) return;
  //   setLoading(true);
  //   try { await saveToFirebase(ans); } catch (e) { console.error(e); }
  //   setAnswer(ans);
  //   setLoading(false);
  // };

  // New — shows response instantly, saves in background
  const handleClick = (ans: AnswerType) => {
  if (!ans) return;
  setAnswer(ans);  // show response immediately
  console.log(ans);
  saveToFirebase(ans).catch((e) => console.error('Firebase error:', e));
    };

  const reset = () => {
    setAnswer(null);
    const btn = noRef.current;
    if (btn) { btn.style.position = ''; btn.style.left = ''; btn.style.top = ''; }
  };
  
  if (!mounted) return null; // Avoid hydration mismatch for the runaway button

  return (
<main className="min-h-screen flex flex-col items-center justify-center px-4"
  style={{ backgroundColor: 'white' }}>

      {/* Floating coffee beans */}
      {['top-10 left-10', 'top-20 right-16', 'bottom-16 left-20', 'bottom-10 right-10'].map((pos, i) => (
        <span
          key={i}
          className={`absolute text-2xl opacity-20 animate-bounce ${pos}`}
          style={{ animationDelay: `${i * 0.4}s`, animationDuration: '3s' }}
        >
          ☕
        </span>
      ))}

      {/* HEADER */}
      <header className="relative z-10 flex items-center gap-4 mb-12 select-none">
        <span className="text-3xl animate-[wiggle_2s_ease-in-out_infinite]">☕</span>
        <h1
          className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #c87a20 0%, #a05020 50%, #6b3010 100%)' }}
        >
          Coffee with Alison
        </h1>
        <span className="text-3xl animate-[wiggle_2s_ease-in-out_infinite_0.5s]">☕</span>
      </header>

      {/* CARD */}
      
      {/* <div className="relative z-10 w-full max-w-md">
        <Card
          question="Coffee this week?"
          answer={answer}
          response={answer ? responses[answer] : undefined}
          onReset={reset}
        >
          <Button variant="yes" onClick={() => handleClick('yes')}>Yes</Button>
          <NoButton />
          <Button variant="ofcourse" onClick={() => handleClick('ofcourse')}>Of course Yes</Button>
          <Button variant="annoying" onClick={() => handleClick('annoying')}>Yes, but you are annoying</Button>
        </Card>
      </div> */}

<div className="w-full max-w-md px-4 align-centre">
    <Card
      question="Coffee this week?"
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

      {/* Google font + custom keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        @keyframes wiggle {
          0%,100% { transform: rotate(-8deg) translateY(0); }
          50%      { transform: rotate(8deg)  translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
