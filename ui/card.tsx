'use client';

import { Button } from '@/ui/button';

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

  const imagePosition: Record<string, string> = {
    yes:      'center',
    ofcourse: 'top',
    annoying: 'center',
    no:       'center',
  };

  return (
    <div
    className="relative z-10 w-full rounded-3xl p-8"
    style={{
      backgroundColor: 'white',
      border: '2px solid #d1d5db',   
      borderRadius: '24px',          
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    }}
  >
      {/* Question state */}
      {!answer && (
        <>
          <p className="text-center text-2xl font-bold text-gray-800 mb-6 w-full">
            {question}
          </p>

          {/* 2x2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {children}
          </div>
        </>
      )}

      {/* Response state */}
      {answer && response && (
        <div className="flex flex-col items-center gap-5 text-center">
          {response.emoji && (
            <span className="text-7xl drop-shadow-lg">{response.emoji}</span>
          )}

          <p className="text-xl text-gray-800 font-semibold italic leading-relaxed">
            {response.message}
          </p>

          <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50">
            <img
              src={response.image}
              alt="response"
              className="w-full h-52 object-contain"
              style={{ objectPosition: imagePosition[answer] }}
            />
          </div>

          <Button variant="yes" onClick={onReset}>
            Go Back ☕
          </Button>
        </div>
      )}
    </div>
  );
}