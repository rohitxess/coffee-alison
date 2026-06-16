'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [step, setStep]         = useState<1 | 2>(1);
  const [rating, setRating]     = useState<number>(0);
  const [hovered, setHovered]   = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(false);

  const getRatingLabel = (r: number) => {
    if (r === 0)  return 'Select a rating';
    if (r <= 2)   return 'Very Poor 😞';
    if (r <= 4)   return 'Poor 😕';
    if (r <= 6)   return 'Average 😐';
    if (r <= 8)   return 'Good 😊';
    if (r <= 10)  return 'Excellent 🤩';
    return '';
  };

  const getRatingColor = (r: number) => {
    if (r === 0)  return '#a1a1aa';
    if (r <= 2)   return '#ef4444';
    if (r <= 4)   return '#f97316';
    if (r <= 6)   return '#f59e0b';
    if (r <= 8)   return '#22c55e';
    return '#2563eb';
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        rating,
        feedback: feedback.trim(),
        createdAt: new Date(),
      });
      setDone(true);
    } catch (e: any) {
      console.error('❌ Feedback error:', e.message);
    }
    setSaving(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* ── SUCCESS STATE ── */}
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#09090b', margin: '0 0 8px 0' }}>
              Thank you!
            </h2>
            <p style={{ fontSize: '14px', color: '#71717a', margin: '0 0 24px 0' }}>
              Your feedback has been submitted successfully.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '10px 32px',
                backgroundColor: '#09090b',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#09090b', margin: '0 0 4px 0' }}>
                  {step === 1 ? '⭐ Rate your experience' : '💬 Share your thoughts'}
                </h2>
                <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                  Step {step} of 2
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#71717a',
                  display: 'flex',
                  padding: '4px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ── STEP INDICATOR ── */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
              {[1, 2].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '4px',
                    backgroundColor: s <= step ? '#09090b' : '#f4f4f5',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            {/* ── STEP 1 — STAR RATING ── */}
            {step === 1 && (
              <div>
                {/* Rating label */}
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: getRatingColor(hovered || rating),
                    margin: '0 0 20px 0',
                    minHeight: '28px',
                    transition: 'color 0.15s',
                  }}
                >
                  {getRatingLabel(hovered || rating)}
                </p>

                {/* Stars 1-10 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '28px',
                    flexWrap: 'wrap',
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => {
                    const isActive = star <= (hovered || rating);
                    return (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '28px',
                          lineHeight: 1,
                          color: isActive ? getRatingColor(hovered || rating) : '#e4e4e7',
                          transform: isActive ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.1s',
                        }}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                {/* Rating number display */}
                {(rating > 0 || hovered > 0) && (
                  <p
                    style={{
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#a1a1aa',
                      margin: '0 0 24px 0',
                    }}
                  >
                    {hovered || rating} / 10
                  </p>
                )}

                {/* Next button */}
                <button
                  onClick={() => setStep(2)}
                  disabled={rating === 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#09090b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: rating === 0 ? 'not-allowed' : 'pointer',
                    opacity: rating === 0 ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (rating > 0) e.currentTarget.style.backgroundColor = '#27272a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
                >
                  Next →
                </button>
              </div>
            )}

            {/* ── STEP 2 — FEEDBACK TEXT ── */}
            {step === 2 && (
              <div>
                {/* Rating summary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: '#fafafa',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    border: '1.5px solid #f4f4f5',
                  }}
                >
                  <span style={{ fontSize: '20px', color: getRatingColor(rating) }}>★</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#09090b' }}>
                    {rating} / 10
                  </span>
                  <span style={{ fontSize: '13px', color: '#71717a' }}>
                    — {getRatingLabel(rating)}
                  </span>
                </div>

                {/* Feedback textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                    Your feedback <span style={{ color: '#a1a1aa', fontWeight: '400' }}>(optional)</span>
                  </label>
                  <textarea
                    placeholder="Tell us what you think... what could be improved?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={5}
                    autoFocus
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #e4e4e7',
                      fontSize: '14px',
                      color: '#09090b',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      backgroundColor: '#fafafa',
                      boxSizing: 'border-box',
                      width: '100%',
                      lineHeight: '1.6',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                  />
                  <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textAlign: 'right' }}>
                    {feedback.length} characters
                  </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'white',
                      color: '#09090b',
                      border: '1.5px solid #e4e4e7',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{
                      flex: 2,
                      padding: '12px',
                      backgroundColor: '#09090b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#27272a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
                  >
                    {saving ? (
                      'Submitting...'
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}