'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { BigCalendar, CalendarEvent } from '@/ui/big-calendar';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc
} from 'firebase/firestore';

const cards = [
  { emoji: '☕', title: 'Coffee this week?',  desc: 'Let Alison know if you want coffee!',  color: '#fef3c7', border: '#f59e0b' },
  { emoji: '📅', title: 'Last meetup',        desc: 'You last had coffee 3 days ago.',       color: '#ede9fe', border: '#8b5cf6' },
  { emoji: '💬', title: 'Responses',          desc: 'You have responded 5 times so far.',    color: '#dcfce7', border: '#22c55e' },
  { emoji: '❤️', title: 'Made with love',     desc: 'This app was made just for you!',       color: '#ffe4e6', border: '#f43f5e' },
  { emoji: '❤️', title: 'Dont make her mad!',     desc: 'Pickup her call!',                 color: '#99B0B0', border: '#99B0B0' },
];

const EVENT_COLORS = [
  { name: 'Blue',   value: '#2563eb' },
  { name: 'Green',  value: '#16a34a' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink',   value: '#ec4899' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Red',    value: '#dc2626' },
  { name: 'Teal',   value: '#0d9488' },
];

const toLocalInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false); 

  const [title, setTitle]         = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime]     = useState('');
  const [color, setColor]         = useState(EVENT_COLORS[0].value);

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'calendar_events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          title: raw.title,
          start: raw.start.toDate(),
          end: raw.end.toDate(),
          color: raw.color || EVENT_COLORS[0].value,
        };
      }) as CalendarEvent[];
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);
  
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setTitle('');
    setStartTime(toLocalInputValue(start));
    setEndTime(toLocalInputValue(end));
    setColor(EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)].value); // random default color
    setShowModal(true);
  };

  const handleSelectEvent = async (event: CalendarEvent) => {
    if (window.confirm(`Delete "${event.title}"?`)) {
      await deleteDoc(doc(db, 'calendar_events', event.id));
    }
  };

  const handleCreateEvent = async () => {
    if (!title.trim() || !startTime || !endTime) return;

    const start = new Date(startTime);
    const end   = new Date(endTime);

    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'calendar_events'), {
        title: title.trim(),
        start,
        end,
        color,
      });
      setShowModal(false);
      setTitle('');
      setStartTime('');
      setEndTime('');
    } catch (e: any) {
      console.error('Error:', e.message);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    setTitle('');
    setStartTime('');
    setEndTime('');
  }

  
    if (!mounted) return null;


  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#09090b', margin: 0 }}>
          Welcome back!! Aunty Alison
        </h1>
        <p style={{ color: '#71717a', fontSize: '15px', marginTop: '6px' }}>
          Here's what's happening.
        </p>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: card.color,
              border: `2px solid ${card.border}`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '32px' }}>{card.emoji}</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#09090b', margin: 0 }}>
              {card.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Go to Coffee Button */}
      <button
        onClick={() => router.push('/coffee')}
        style={{
          backgroundColor: '#09090b',
          color: 'white',
          border: '2px solid #09090b',
          borderRadius: '12px',
          padding: '14px 32px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
      >
        Coffee Page
      </button>

        {/* Calendar Section */}

      
    <div
      style={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        padding: '24px',
      }}
    >

      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <BigCalendar
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div
          onClick={handleCancel}
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
              borderRadius: '16px',
              padding: '28px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#09090b', margin: 0 }}>
                 New Event
              </h2>
              <button
                onClick={handleCancel}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#71717a',
                  display: 'flex',
                  alignItems: 'center',
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

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Event Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Team Meeting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #e4e4e7',
                    fontSize: '14px',
                    color: '#09090b',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    boxSizing: 'border-box',
                    width: '100%',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Start Time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #e4e4e7',
                    fontSize: '14px',
                    color: '#09090b',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    boxSizing: 'border-box',
                    width: '100%',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* End Time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #e4e4e7',
                    fontSize: '14px',
                    color: '#09090b',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    boxSizing: 'border-box',
                    width: '100%',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Color Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Event Color
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      title={c.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c.value,
                        border: color === c.value ? '3px solid #09090b' : '3px solid transparent',
                        cursor: 'pointer',
                        padding: 0,
                        boxShadow: color === c.value ? '0 0 0 2px white inset' : 'none',
                        transition: 'all 0.15s',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                {/* Cancel — black bg, white text */}
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#09090b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
                >
                  Cancel
                </button>

                {/* Create Event — white bg, black text */}
                <button
                  onClick={handleCreateEvent}
                  disabled={saving || !title.trim() || !startTime || !endTime}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'white',
                    color: '#09090b',
                    border: '1.5px solid #e4e4e7',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: !title.trim() || !startTime || !endTime ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (title.trim() && startTime && endTime) e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  {saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    </div>
  );
}