'use client';

import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import dynamic from 'next/dynamic';

const HolidayMap = dynamic(() => import('@/ui/holidayMap'), {
  ssr: false,
});

type Pin = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  notes: string;
  photo: string;
  createdAt: any;
};

export default function HolidayPage() {
  const [pins, setPins]           = useState<Pin[]>([]);
  const [mounted, setMounted]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName]           = useState('');
  const [notes, setNotes]         = useState('');
  const [photo, setPhoto]         = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  
    const q = query(collection(db, 'holiday_pins'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Pin[];
      setPins(data);
    });
    return () => unsubscribe();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setPendingCoords({ lat, lng });
    setShowModal(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `holiday/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhoto(url);
    } catch (e: any) {
      console.error('❌ Upload error:', e.message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !pendingCoords) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'holiday_pins'), {
        lat: pendingCoords.lat,
        lng: pendingCoords.lng,
        name: name.trim(),
        notes: notes.trim(),
        photo: photo || '',
        createdAt: new Date(),
      });
      setName('');
      setNotes('');
      setPhoto(null);
      setPendingCoords(null);
      setShowModal(false);
    } catch (e: any) {
      console.error('❌ Error:', e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'holiday_pins', id));
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingCoords(null);
    setName('');
    setNotes('');
    setPhoto(null);
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e4e4e7',
          flexShrink: 0,
        }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#09090b', margin: '0 0 4px 0' }}>
          🌴 Holiday Destinations
        </h1>
        <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
          Click anywhere on the map to pin a destination • {pins.length} {pins.length === 1 ? 'pin' : 'pins'} saved
        </p>
      </div>
  
        {/* Map */}
<div style={{ flex: 1, position: 'relative' }}>
  <HolidayMap
    pins={pins}
    onMapClick={handleMapClick}
    onDelete={handleDelete}
  />
</div>

      {/* Add Pin Modal */}
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
                📍 Pin a Destination
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

            {/* Coordinates display */}
            {pendingCoords && (
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '0 0 16px 0' }}>
                📍 {pendingCoords.lat.toFixed(4)}, {pendingCoords.lng.toFixed(4)}
              </p>
            )}

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Destination Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bali, Indonesia"
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
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Notes
                </label>
                <textarea
                  placeholder="Why do you want to go here?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {/* Photo Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
                  Photo
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                {photo ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={photo}
                      alt="preview"
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <button
                      onClick={() => setPhoto(null)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{
                      padding: '20px',
                      backgroundColor: '#fafafa',
                      border: '1.5px dashed #e4e4e7',
                      borderRadius: '10px',
                      fontSize: '13px',
                      color: '#71717a',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.borderColor = '#a1a1aa'; }}
                    onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.borderColor = '#e4e4e7'; }}
                  >
                    {uploading ? 'Uploading...' : '📷 Click to upload photo'}
                  </button>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  onClick={handleCancel}
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
                  disabled={saving || !name.trim()}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#09090b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: !name.trim() ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (name.trim()) e.currentTarget.style.backgroundColor = '#27272a'; }}
                  onMouseLeave={(e) => { if (name.trim()) e.currentTarget.style.backgroundColor = '#09090b'; }}
                >
                  {saving ? 'Saving...' : '📍 Save Pin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}