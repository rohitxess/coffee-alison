'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type AnswerType = 'yes' | 'ofcourse' | 'annoying' | 'no' | null;

const responses: Record<NonNullable<AnswerType>, { emoji: string; message: string }> = {
  yes:      { emoji: '☕',  message: "Yay! Coffee time!" },
  ofcourse: { emoji: '✨',  message: "OBVIOUSLY!" },
  annoying: { emoji: '😤',  message: "I'll take it as a compliment" },
  no:       { emoji: '😏',  message: "Nice try. You literally can't say no to coffee." },
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

  // ✅ New — shows response instantly, saves in background
  const handleClick = (ans: AnswerType) => {
  if (!ans) return;
  setAnswer(ans);  // show response immediately
  console.log(ans);
  saveToFirebase(ans).catch((e) => console.error('❌ Firebase error:', e));
    };

// Runaway logic for the "No" button - flies off the screen

  // const runAway = useCallback(() => {
  //   const btn = noRef.current;
  //   if (!btn) return;
  //   const vw = window.innerWidth  - 160;
  //   const vh = window.innerHeight - 60;
  //   btn.style.position = 'fixed';
  //   btn.style.left     = `${Math.random() * vw}px`;
  //   btn.style.top      = `${Math.random() * vh}px`;
  //   btn.style.zIndex   = '9999';
  // }, []);

// button to stay visible on the screen
const runAway = useCallback(() => {
  const btn = noRef.current;
  if (!btn) return;

  const btnWidth  = btn.offsetWidth;
  const btnHeight = btn.offsetHeight;

  const maxX = window.innerWidth  - btnWidth  - 20; // 20px padding from edge
  const maxY = window.innerHeight - btnHeight - 20; // 20px padding from edge

  const randomX = Math.max(20, Math.random() * maxX);
  const randomY = Math.max(20, Math.random() * maxY);

  btn.style.position = 'fixed';
  btn.style.left     = `${randomX}px`;
  btn.style.top      = `${randomY}px`;
  btn.style.zIndex   = '9999';
}, []);

  const reset = () => {
    setAnswer(null);
    const btn = noRef.current;
    if (btn) { btn.style.position = ''; btn.style.left = ''; btn.style.top = ''; }
  };
  
  if (!mounted) return null; // Avoid hydration mismatch for the runaway button

  return (
    <main className="min-h-screen bg-[#0f0500] flex flex-col items-center justify-center px-4 overflow-hidden relative">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-900/20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-950/30 blur-3xl" />
      </div>

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
        <span className="text-4xl animate-[wiggle_2s_ease-in-out_infinite]">☕</span>
        <h1
          className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #f5c87a 0%, #d4843a 50%, #a05020 100%)', fontFamily: "'Playfair Display', serif" }}
        >
          Coffee with Alison
        </h1>
        <span className="text-4xl animate-[wiggle_2s_ease-in-out_infinite_0.5s]">☕</span>
      </header>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-amber-800/30 bg-white/5 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-8 md:p-10">

          {!answer ? (
            <>
              <p
                className="text-center text-2xl text-amber-100/90 mb-8 italic"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Coffee this week?
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* YES */}
                <button
                  onClick={() => handleClick('yes')}
                  // disabled={loading}
                  className="col-span-1 py-3 px-4 rounded-xl font-bold text-white text-sm
                    bg-gradient-to-br from-amber-500 to-amber-700
                    hover:from-amber-400 hover:to-amber-600
                    hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/40
                    active:translate-y-0 transition-all duration-150 disabled:opacity-50"
                >
                  Yes!
                </button>

                {/* NO — the runaway button */}
                <button
                  ref={noRef}
                  onMouseEnter={runAway}
                  onClick={() => handleClick('no')}
                  cursor-not-allowed
                  select-none
                  className="col-span-1 py-3 px-4 rounded-xl font-bold text-zinc-400 text-sm
                    bg-zinc-800/80 border border-zinc-600/40
                    hover:bg-zinc-700/80 hover:text-zinc-300
                    active:translate-y-0 transition-colors duration-75 cursor-not-allowed"
                  style={{ transition: 'left 0.06s, top 0.06s, background 0.15s' }}
                >
                  ❌ No
                </button>

                {/* OF COURSE */}
                <button
                  onClick={() => handleClick('ofcourse')}
                  // disabled={loading}
                  className="col-span-1 py-3 px-4 rounded-xl font-bold text-amber-900 text-sm
                    bg-gradient-to-br from-yellow-300 to-amber-400
                    hover:from-yellow-200 hover:to-amber-300
                    hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/30
                    active:translate-y-0 transition-all duration-150 disabled:opacity-50"
                >
                  🌟 Of course yes
                </button>

                {/* ANNOYING */}
                <button
                  onClick={() => handleClick('annoying')}
                  // disabled={loading}
                  className="col-span-1 py-3 px-4 rounded-xl font-bold text-zinc-500 text-xs
                    border border-zinc-700/50 bg-transparent
                    hover:border-orange-800/60 hover:text-orange-400/70 hover:bg-orange-950/20
                    active:translate-y-0 transition-all duration-150 disabled:opacity-50"
                >
                  Yes!! But you are annoying
                </button>
              </div>

              {/* {loading && (
                <p className="text-center text-amber-600/60 text-xs mt-4 animate-pulse">
                  Saving your answer…
                </p>
              )} */}
            </>
          ) : (
            /* RESPONSE STATE */
            <div className="flex flex-col items-center gap-5 text-center animate-[fadeIn_0.4s_ease]">
              <span className="text-7xl drop-shadow-lg">{responses[answer].emoji}</span>
              <p
                className="text-xl text-amber-100 italic leading-relaxed"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {responses[answer].message}
              </p>
              <p className="text-xs text-amber-700/60">Answer saved to Firebase ✓</p>
              <button
                onClick={reset}
                className="mt-2 py-2.5 px-6 rounded-xl font-bold text-sm text-white
                  bg-gradient-to-br from-amber-500 to-amber-700
                  hover:from-amber-400 hover:to-amber-600
                  hover:-translate-y-1 hover:shadow-lg
                  transition-all duration-150"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
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
