'use client';

import { Button } from './button';

type AnswerType = 'yes' | 'ofcourse' | 'annoying' | 'no';

interface ResponseData {
  emoji: string;
  message: string;
  image: string;
}

interface CardProps {
  question?: string;
  response?: ResponseData;
  answer?: AnswerType | null;
  onReset?: () => void;
  children?: React.ReactNode;
}

export function Card({ question, response, answer, onReset, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-amber-800/30 bg-white/5 backdrop-blur-xl
      shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-8 md:p-10 w-full max-w-md"
    >
      {/* Question state — renders buttons passed as children */}
      {!answer && (
        <>
          <p
            className="text-center text-2xl text-amber-100/90 mb-8 italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {question}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {children}
          </div>
        </>
      )}

      {/* Response state */}
      {answer && response && (
        <div className="flex flex-col items-center gap-5 text-center animate-[fadeIn_0.4s_ease]">
          <span className="text-7xl drop-shadow-lg">{response.emoji}</span>

          <p
            className="text-xl text-amber-100 italic leading-relaxed"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {response.message}
          </p>

          {/* Image */}
          <div className="w-full rounded-2xl overflow-hidden border border-amber-800/30 shadow-xl">
            <img
              src={response.image}
              alt="response"
              className="w-full h-52 object-cover"
            />
          </div>

          {/* <p className="text-xs text-amber-700/60">Answer saved to Firebase ✓</p> */}

          <Button variant="yes" onClick={onReset}>
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
}