

'use client';

import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

type Photo = {
  id: string;
  url: string;
  name: string;
  createdAt: any;
};

export default function GalleryPage() {
  const [photos, setPhotos]       = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [mounted, setMounted]     = useState(false);
  const [selected, setSelected]   = useState<Photo | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Photo[];
      setPhotos(data);
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow jpeg and png
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPEG and PNG files are allowed!');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Upload to Firebase Storage
      const storageRef  = ref(storage, `gallery/${Date.now()}_${file.name}`);
      const uploadTask  = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (error) => {
          console.error('❌ Upload error:', error.message);
          setUploading(false);
        },
        async () => {
          // Get download URL and save to Firestore
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'gallery'), {
            url,
            name: file.name,
            createdAt: new Date(),
          });
          console.log('✅ Photo uploaded!');
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (e: any) {
      console.error('❌ Error:', e.message);
      setUploading(false);
    }

    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (photo: Photo) => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, `gallery/${photo.name}`);
      await deleteObject(storageRef).catch(() => {});

      // Delete from Firestore
      await deleteDoc(doc(db, 'gallery', photo.id));
      console.log('✅ Photo deleted!');
      if (selected?.id === photo.id) setSelected(null);
    } catch (e: any) {
      console.error('❌ Delete error:', e.message);
    }
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
          borderBottom: '1px solid #e4e4e7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#09090b', margin: '0 0 4px 0' }}>
            🖼️ Gallery
          </h1>
          <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#09090b',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.backgroundColor = '#27272a'; }}
            onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.backgroundColor = '#09090b'; }}
          >
            {/* Upload Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            {uploading ? `Uploading ${progress}%` : 'Upload Photo'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div style={{ width: '100%', height: '3px', backgroundColor: '#e4e4e7' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#09090b',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Photo Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        {photos.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#71717a',
              gap: '12px',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style={{ fontSize: '14px', margin: 0 }}>No photos yet. Upload your first one!</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1.5px solid #e4e4e7',
                  aspectRatio: '1',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                }}
                onClick={() => setSelected(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>

                {/* Photo name */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '8px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {photo.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — click photo to expand */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
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
              position: 'relative',
              maxWidth: '80vw',
              maxHeight: '80vh',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <img
              src={selected.url}
              alt={selected.name}
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}