'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

type Book = {
  id: string;
  type: string;
  name: string;
  author: string;
  link: string;
  createdAt: any;
};

export default function ReadingListPage() {
  const [books, setBooks]       = useState<Book[]>([]);
  const [mounted, setMounted]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ type: string; name: string; author: string; link: string }>({
    type: '', name: '', author: '', link: '',
  });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'reading_list'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Book[];
      setBooks(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddRow = async () => {
    setSaving(true);
    try {
      await addDoc(collection(db, 'reading_list'), {
        type: '',
        name: 'New book',
        author: '',
        link: '',
        createdAt: new Date(),
      });
    } catch (e: any) {
      console.error('❌ Error:', e.message);
    }
    setSaving(false);
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.id);
    setEditData({ type: book.type, name: book.name, author: book.author, link: book.link });
  };

  const handleFieldChange = (field: keyof typeof editData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveRow = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reading_list', id), {
        type:   editData.type,
        name:   editData.name,
        author: editData.author,
        link:   editData.link,
      });
      setEditingId(null);
    } catch (e: any) {
      console.error('❌ Update error:', e.message);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'reading_list', id));
    if (editingId === id) setEditingId(null);
  };

  const handleSaveAll = async () => {
    if (editingId) {
      await handleSaveRow(editingId);
    }
  };

  if (!mounted) return null;

  const cellStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '13px',
    color: 'white',
    borderBottom: '1px solid #27272a',
    boxSizing: 'border-box',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    padding: '6px 8px',
    fontSize: '13px',
    color: 'white',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#09090b',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid #27272a',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: '0 0 4px 0' }}>
            📚 Reading List
          </h1>
          <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Add Row */}
          <button
            onClick={handleAddRow}
            disabled={saving}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1.5px solid #3f3f46',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#18181b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Book
          </button>

          {/* Save */}
          <button
            onClick={handleSaveAll}
            style={{
              padding: '10px 24px',
              backgroundColor: 'white',
              color: '#09090b',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e4e4e7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* Header Row */}
          <thead>
            <tr style={{ backgroundColor: '#000000' }}>
              <th style={{ ...cellStyle, textAlign: 'left', fontWeight: '600', color: '#a1a1aa', width: '18%' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                  Type
                </span>
              </th>
              <th style={{ ...cellStyle, textAlign: 'left', fontWeight: '600', color: '#a1a1aa', width: '32%' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7V4h16v3"/>
                    <path d="M9 20h6"/>
                    <path d="M12 4v16"/>
                  </svg>
                  Name
                </span>
              </th>
              <th style={{ ...cellStyle, textAlign: 'left', fontWeight: '600', color: '#a1a1aa', width: '20%' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                  Author
                </span>
              </th>
              <th style={{ ...cellStyle, textAlign: 'left', fontWeight: '600', color: '#a1a1aa', width: '20%' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Link
                </span>
              </th>
              <th style={{ ...cellStyle, width: '40px' }} />
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...cellStyle, textAlign: 'center', color: '#71717a', padding: '40px' }}>
                  No books yet. Click "Add Book" to get started!
                </td>
              </tr>
            ) : (
              books.map((book) => {
                const isEditing = editingId === book.id;
                return (
                  <tr
                    key={book.id}
                    onClick={() => !isEditing && handleEdit(book)}
                    style={{
                      backgroundColor: isEditing ? '#18181b' : 'transparent',
                      cursor: isEditing ? 'default' : 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = '#111113'; }}
                    onMouseLeave={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Type */}
                    <td style={cellStyle}>
                      {isEditing ? (
                        <input
                          value={editData.type}
                          onChange={(e) => handleFieldChange('type', e.target.value)}
                          style={inputStyle}
                          placeholder="e.g. Stock Market"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span style={{ color: '#a1a1aa' }}>{book.type || '—'}</span>
                      )}
                    </td>

                    {/* Name */}
                    <td style={cellStyle}>
                      {isEditing ? (
                        <input
                          value={editData.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          style={{ ...inputStyle, fontWeight: '600' }}
                          placeholder="Book name"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {book.name || '—'}
                        </span>
                      )}
                    </td>

                    {/* Author */}
                    <td style={cellStyle}>
                      {isEditing ? (
                        <input
                          value={editData.author}
                          onChange={(e) => handleFieldChange('author', e.target.value)}
                          style={inputStyle}
                          placeholder="Author name"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span style={{ color: '#d4d4d8' }}>{book.author || '—'}</span>
                      )}
                    </td>

                    {/* Link */}
                    <td style={cellStyle}>
                      {isEditing ? (
                        <input
                          value={editData.link}
                          onChange={(e) => handleFieldChange('link', e.target.value)}
                          style={inputStyle}
                          placeholder="https://..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : book.link ? (
                        <a
                          href={book.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '12px' }}
                          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                        >
                          🔗 Open link
                        </a>
                      ) : (
                        <span style={{ color: '#52525b' }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {/* Confirm */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSaveRow(book.id); }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#22c55e',
                              padding: '4px',
                              borderRadius: '6px',
                              display: 'flex',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#14532d33'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </button>
                          {/* Cancel */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#71717a',
                              padding: '4px',
                              borderRadius: '6px',
                              display: 'flex',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(book.id); }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              padding: '4px',
                              borderRadius: '6px',
                              display: 'flex',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7f1d1d33'; }}
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
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}