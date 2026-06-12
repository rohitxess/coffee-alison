'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';

type Poem = {
  id: string;
  title: string;
  content: string;
  createdAt: any;
};

export default function PoetryPage() {
  const [poems, setPoems]         = useState<Poem[]>([]);
  const [mounted, setMounted]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'poetry'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Poem[];
      setPoems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'poetry'), {
        title:     title.trim(),
        content:   content.trim(),
        createdAt: new Date(),
      });
      setTitle('');
      setContent('');
      setShowModal(false);
    } catch (e: any) {
      console.error('❌ Error:', e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'poetry', id));
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px 24px 16px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #f4f4f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#09090b', margin: '0 0 4px 0' }}>
            ✍️ Poetry
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '13px', margin: 0 }}>
            {poems.length} {poems.length === 1 ? 'poem' : 'poems'}
          </p>
        </div>

        {/* Write Button */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#09090b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Write
        </button>
      </div>

      {/* Poems List — scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 24px',
          boxSizing: 'border-box',
        }}
      >
        {poems.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: '#a1a1aa',
            }}
          >
            <span style={{ fontSize: '48px' }}>✍️</span>
            <p style={{ fontSize: '15px', margin: 0, fontWeight: '500' }}>
              No poems yet. Click Write to get started!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {poems.map((poem, index) => (
              <div
                key={poem.id}
                style={{
                  display: 'flex',
                  justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end', // ← alternates left/right
                }}
              >
                <div
                  style={{
                    width: '65%',
                    backgroundColor: index % 2 === 0 ? 'white' : '#09090b',
                    borderRadius: index % 2 === 0
                      ? '4px 20px 20px 20px'   // ← left card shape
                      : '20px 4px 20px 20px',  // ← right card shape
                    padding: '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: index % 2 === 0 ? '1.5px solid #f4f4f5' : 'none',
                    position: 'relative',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(poem.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: index % 2 === 0 ? '#d4d4d8' : '#52525b',
                      padding: '4px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fee2e2' : '#1c1c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = index % 2 === 0 ? '#d4d4d8' : '#52525b';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>

                  {/* Quote mark */}
                  <div
                    style={{
                      fontSize: '48px',
                      lineHeight: 1,
                      color: index % 2 === 0 ? '#f4f4f5' : '#27272a',
                      marginBottom: '8px',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    "
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: index % 2 === 0 ? '#09090b' : 'white',
                      margin: '0 0 12px 0',
                      paddingRight: '24px',
                    }}
                  >
                    {poem.title}
                  </h3>

                  {/* Content */}
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.8',
                      color: index % 2 === 0 ? '#52525b' : '#a1a1aa',
                      margin: '0 0 16px 0',
                      whiteSpace: 'pre-wrap', // ← preserves line breaks
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {poem.content}
                  </p>

                  {/* Date */}
                  <p
                    style={{
                      fontSize: '11px',
                      color: index % 2 === 0 ? '#d4d4d8' : '#52525b',
                      margin: 0,
                      textAlign: 'right',
                    }}
                  >
                    {formatDate(poem.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              maxWidth: '560px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#09090b', margin: 0 }}>
                ✍️ Write a Poem
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

              {/* Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Give your poem a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #e4e4e7',
                    fontSize: '14px',
                    color: '#09090b',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Poem
                </label>
                <textarea
                  placeholder="Write your poem here...&#10;&#10;Each line break will be preserved."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #e4e4e7',
                    fontSize: '14px',
                    color: '#09090b',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'Georgia, serif',
                    lineHeight: '1.8',
                    backgroundColor: '#fafafa',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Character count */}
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textAlign: 'right' }}>
                {content.length} characters
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
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
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim() || !content.trim()}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#09090b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: !title.trim() || !content.trim() ? 0.5 : 1,
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => { if (title.trim() && content.trim()) e.currentTarget.style.backgroundColor = '#27272a'; }}
                  onMouseLeave={(e) => { if (title.trim() && content.trim()) e.currentTarget.style.backgroundColor = '#09090b'; }}
                >
                  {saving ? 'Saving...' : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}