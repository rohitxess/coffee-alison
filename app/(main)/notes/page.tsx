'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

type Note = {
  id: string;
  question: string;
  response: string;
  createdAt: any;
};

const NOTES_PER_PAGE = 5; // ← change this to show more or fewer per page

export default function NotesPage() {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [search, setSearch]     = useState('');
  const [mounted, setMounted]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1); 
  const [editing, setEditing]   = useState<Note | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editResponse, setEditResponse] = useState('');  

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      setNotes(data);
    });
    return () => unsubscribe();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSave = async () => {
    if (!question.trim() || !response.trim()) return;
    setSaving(true);
  
    console.log('📝 Attempting to save...');
  
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        question: question.trim(),
        response: response.trim(),
        createdAt: serverTimestamp(),
      });
      console.log('✅ Saved! ID:', docRef.id);
      setQuestion('');
      setResponse('');
      setPage(1);
    } catch (e: any) {
      console.error('❌ Error code:', e.code);
      console.error('❌ Error message:', e.message);
    }
  
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  };

  const handleEdit = async (note: Note) => {
    setEditing(note);
    setEditQuestion(note.question);
    setEditResponse(note.response);
  }

  const handleUpdate = async () => {
    if (!editing || !editQuestion.trim() || !editResponse.trim()) return;
    try {
      await updateDoc(doc(db, 'notes', editing.id), {
        question: editQuestion.trim(),
        response: editResponse.trim(),
      });
      console.log('✅ Note updated!');
      setEditing(null);
      setEditQuestion('');
      setEditResponse('');
    } catch (e: any) {
      console.error('❌ Update error:', e.message);
    }
  };

  // Filter notes by search
  const filteredNotes = notes.filter(
    (note) =>
      note.question.toLowerCase().includes(search.toLowerCase()) ||
      note.response.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages    = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
  const startIndex    = (page - 1) * NOTES_PER_PAGE;
  const endIndex      = startIndex + NOTES_PER_PAGE;
  const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

  if (!mounted) return null;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Page Header */}
      <div style={{ padding: '24px 24px 0 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#09090b', margin: '0 0 4px 0' }}>
          📝 Notes
        </h1>
        <p style={{ color: '#71717a', fontSize: '14px', margin: '0 0 16px 0' }}>
          Add your questions and responses here.
        </p>

        {/* Search Box */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#71717a',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search questions or responses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '10px',
              border: '1.5px solid #e4e4e7',
              fontSize: '14px',
              color: '#09090b',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#fafafa',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#a05020'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#e4e4e7', marginBottom: '16px' }} />

        {/* Input Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          {/* Question */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              Question
            </label>
            <textarea
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #e4e4e7',
                fontSize: '14px',
                color: '#09090b',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                backgroundColor: '#fafafa',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#a05020'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>

          {/* Response */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              Response
            </label>
            <textarea
              placeholder="Type your response here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #e4e4e7',
                fontSize: '14px',
                color: '#09090b',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                backgroundColor: '#fafafa',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#a05020'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !question.trim() || !response.trim()}
          style={{
            padding: '10px 24px',
            backgroundColor: '#09090b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: !question.trim() || !response.trim() ? 0.5 : 1,
            marginBottom: '16px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
        >
          {saving ? 'Saving...' : '+ Save Note'}
        </button>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#e4e4e7', marginBottom: '12px' }} />
      </div>

      {/* Notes List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px', boxSizing: 'border-box' }}>
        {filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#71717a', fontSize: '14px', marginTop: '40px' }}>
            {search ? 'No notes match your search.' : 'No notes yet. Add your first one above!'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '12px',
                  alignItems: 'start',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1.5px solid #e4e4e7',
                  backgroundColor: '#fafafa',
                }}
              >
                {/* Question */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#a05020', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Question
                  </p>
                  <p style={{ fontSize: '14px', color: '#09090b', margin: 0 }}>
                    {note.question}
                  </p>
                </div>

                {/* Response */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Response
                  </p>
                  <p style={{ fontSize: '14px', color: '#09090b', margin: 0 }}>
                    {note.response}
                  </p>
                </div>

                {/* Edit + Delete buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                {/* Edit Button */}
                <button
                  onClick={() => handleEdit(note)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#a05020',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(note.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderTop: '1px solid #e4e4e7',
            backgroundColor: 'white',
            flexShrink: 0,
          }}
        >
          {/* Info */}
          <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
            Showing {startIndex + 1}–{Math.min(endIndex, filteredNotes.length)} of {filteredNotes.length} notes
          </p>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {/* Previous */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1.5px solid #e4e4e7',
                backgroundColor: 'white',
                color: page === 1 ? '#d4d4d8' : '#09090b',
                fontSize: '13px',
                fontWeight: '500',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              ← Prev
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: page === p ? '#09090b' : '#e4e4e7',
                  backgroundColor: page === p ? '#09090b' : 'white',
                  color: page === p ? 'white' : '#09090b',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  minWidth: '36px',
                }}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1.5px solid #e4e4e7',
                backgroundColor: 'white',
                color: page === totalPages ? '#d4d4d8' : '#09090b',
                fontSize: '13px',
                fontWeight: '500',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <style>{`
        input::placeholder, textarea::placeholder { color: #a1a1aa; }
      `}</style>

      {/* Edit Modal */}
{editing && (
  <div
    onClick={() => setEditing(null)}
    style={{
      position: 'fixed',
      inset: 0,
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
        maxWidth: '520px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#09090b', margin: 0 }}>
          ✏️ Edit Note
        </h2>
        <button
          onClick={() => setEditing(null)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#71717a',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
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

      {/* Edit Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Question */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
            Question
          </label>
          <textarea
            value={editQuestion}
            onChange={(e) => setEditQuestion(e.target.value)}
            rows={3}
            style={{
              padding: '10px 12px',
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
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#a05020'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
          />
        </div>

        {/* Response */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
            Response
          </label>
          <textarea
            value={editResponse}
            onChange={(e) => setEditResponse(e.target.value)}
            rows={3}
            style={{
              padding: '10px 12px',
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
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#a05020'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setEditing(null)}
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
            onClick={handleUpdate}
            disabled={!editQuestion.trim() || !editResponse.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#09090b',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: !editQuestion.trim() || !editResponse.trim() ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}




    </div>
  );
}