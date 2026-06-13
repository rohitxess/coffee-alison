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
  updateDoc,
} from 'firebase/firestore';

type WishItem = {
  id: string;
  name: string;
  price: string;
  image: string;
  reserved: boolean;
  createdAt: any;
};

export default function WishlistPage() {
  const [items, setItems]         = useState<WishItem[]>([]);
  const [mounted, setMounted]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [name, setName]           = useState('');
  const [price, setPrice]         = useState('');
  const [image, setImage]         = useState('');

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'wishlist'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as WishItem[];
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'wishlist'), {
        name:     name.trim(),
        price:    price.trim(),
        image:    image.trim(),
        reserved: false,
        createdAt: new Date(),
      });
      setName('');
      setPrice('');
      setImage('');
      setShowModal(false);
    } catch (e: any) {
      console.error('❌ Error:', e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'wishlist', id));
  };

  const handleReserve = async (id: string, reserved: boolean) => {
    await updateDoc(doc(db, 'wishlist', id), { reserved: !reserved });
  };

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
      {/* Header */}
      <div
        style={{
          padding: '24px 24px 16px 24px',
          flexShrink: 0,
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#09090b', margin: 0 }}>
              My Wishlist 🎁
            </h1>
            {/* Edit icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>

          {/* Right buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Three dots */}
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#71717a',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
              </svg>
            </button>

            {/* Share button */}
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#09090b',
                border: '1.5px solid #e4e4e7',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>

            {/* Add Wish button */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f43f5e',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e11d48'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f43f5e'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Wish
            </button>
          </div>
        </div>

        {/* Description
        <p style={{ color: '#a1a1aa', fontSize: '13px', margin: '4px 0 0 0' }}>
          Add description...
        </p> */}

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#f4f4f5', marginTop: '16px' }} />
      </div>

      {/* Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px 24px 24px',
          boxSizing: 'border-box',
        }}
      >
        {items.length === 0 ? (
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
            <span style={{ fontSize: '48px' }}>🎁</span>
            <p style={{ fontSize: '14px', margin: 0 }}>
              No wishes yet. Click + Add Wish to get started!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: '16px',
                  border: '1.5px solid #f4f4f5',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              >
                {/* Reserved badge */}
                {item.reserved && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'white',
                      color: '#09090b',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      zIndex: 1,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    Reserved
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    opacity: 0,
                    transition: 'opacity 0.15s',
                  }}
                  className="delete-btn"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>

                {/* Image */}
                <div
                  style={{
                    height: '150px',
                    backgroundColor: item.reserved ? '#bbf7d0' : '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>🎁</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '10px 12px 12px 12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#09090b', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  {item.price && (
                    <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 8px 0' }}>
                      ${item.price}
                    </p>
                  )}

                  {/* Reserve button */}
                  <button
                    onClick={() => handleReserve(item.id, item.reserved)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      backgroundColor: item.reserved ? '#f4f4f5' : '#09090b',
                      color: item.reserved ? '#71717a' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {item.reserved ? 'Unreserve' : 'Reserve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Wish Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#09090b', margin: 0 }}>
                🎁 Add a Wish
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nike Air Max"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#f43f5e'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Price */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Price
                </label>
                <input
                  type="text"
                  placeholder="e.g. 199"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#f43f5e'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Image URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
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
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#f43f5e'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Image preview */}
              {image && (
                <div
                  style={{
                    width: '100%',
                    height: '120px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1.5px solid #e4e4e7',
                  }}
                >
                  <img
                    src={image}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
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
                  onClick={handleAdd}
                  disabled={saving || !name.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f43f5e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: !name.trim() ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (name.trim()) e.currentTarget.style.backgroundColor = '#e11d48'; }}
                  onMouseLeave={(e) => { if (name.trim()) e.currentTarget.style.backgroundColor = '#f43f5e'; }}
                >
                  {saving ? 'Adding...' : '+ Add Wish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show delete button on card hover */}
      <style>{`
        div:hover > .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}