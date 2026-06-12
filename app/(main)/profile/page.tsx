'use client';

import { useState, useRef, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PROFILE_DOC_ID = 'main-profile'; // single profile document

export default function ProfilePage() {
  const [coverImage, setCoverImage]     = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName]       = useState('Alison');
  const [lastName, setLastName]         = useState('Lu');
  const [username, setUsername]         = useState('@alison');
  const [location, setLocation]         = useState('Sydney, Australia');
  const [specialDay, setspecialDay]     = useState('5th August');
  const [gender, setGender]             = useState('Female');
  const [saved, setSaved]               = useState(false);
  const [saving, setSaving]             = useState(false);
  const [loading, setLoading]           = useState(true);
  const [uploadingCover, setUploadingCover]     = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const coverRef   = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);

  // Load profile from Firestore on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const docRef  = doc(db, 'profile', PROFILE_DOC_ID);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setFirstName(data.firstName || 'Alison');
          setLastName(data.lastName || 'Lu');
          setUsername(data.username || '@alison');
          setLocation(data.location || 'Sydney, Australia');
          setspecialDay(data.specialDay || '5th August');
          setGender(data.gender || 'Female');
          setCoverImage(data.coverImage || null);
          setProfileImage(data.profileImage || null);
        }
      } catch (e: any) {
        console.error('❌ Error loading profile:', e.message);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  // Upload cover image to Storage and update state
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const storageRef = ref(storage, `profile/cover_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setCoverImage(url);
      console.log('✅ Cover uploaded!');
    } catch (e: any) {
      console.error('❌ Cover upload error:', e.message);
    }
    setUploadingCover(false);
  };

  // Upload profile picture to Storage and update state
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      const storageRef = ref(storage, `profile/avatar_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileImage(url);
      console.log('✅ Profile picture uploaded!');
    } catch (e: any) {
      console.error('❌ Profile upload error:', e.message);
    }
    setUploadingProfile(false);
  };

  // Save all profile data to Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'profile', PROFILE_DOC_ID), {
        firstName,
        lastName,
        username,
        location,
        specialDay,
        gender,
        coverImage:   coverImage   || null,
        profileImage: profileImage || null,
        updatedAt: new Date(),
      });

      console.log('✅ Profile saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error('❌ Save error:', e.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f4f4f5',
          color: '#71717a',
          fontSize: '14px',
        }}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#f4f4f5',
        overflowY: 'auto',
        padding: '32px',
        boxSizing: 'border-box',
      }}
    >

      {/* ── CARD 1 — Cover + Profile Picture + Name ── */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1.5px solid #e4e4e7',
          overflow: 'hidden',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Cover Image */}
        <div
          style={{
            height: '160px',
            background: coverImage
              ? `url(${coverImage}) center/cover no-repeat`
              : 'linear-gradient(135deg, #fde68a 0%, #fca5a5 100%)',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => coverRef.current?.click()}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0)',
              transition: 'background 0.2s',
              color: 'transparent',
              fontSize: '13px',
              fontWeight: '600',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.25)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)';
              e.currentTarget.style.color = 'transparent';
            }}
          >
            {uploadingCover ? (
              <span style={{ color: 'white' }}>Uploading...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Change cover
              </>
            )}
          </div>

          <input
            ref={coverRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleCoverUpload}
            style={{ display: 'none' }}
          />

          <button
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>

        {/* Profile Picture + Info */}
        <div style={{ padding: '0 24px 24px 24px' }}>

          {/* Profile Picture */}
          <div style={{ position: 'relative', width: 'fit-content', marginTop: '-48px', marginBottom: '16px' }}>
            <div
              onClick={() => profileRef.current?.click()}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                border: '4px solid white',
                backgroundColor: '#e4e4e7',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {!profileImage && !uploadingProfile && (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              {uploadingProfile && (
                <span style={{ fontSize: '11px', color: '#71717a' }}>Uploading...</span>
              )}
            </div>

            {/* Camera icon */}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                backgroundColor: '#09090b',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid white',
              }}
              onClick={() => profileRef.current?.click()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>

            <input
              ref={profileRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleProfileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Name + details */}
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#09090b', margin: '0 0 6px 0' }}>
            {firstName} {lastName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span>🇦🇺</span>
            <span style={{ color: '#71717a', fontSize: '14px' }}>{location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: '#71717a', fontSize: '14px' }}>{username}</span>
            <span style={{ color: '#d4d4d8' }}>•</span>
            <span style={{ color: '#09090b', fontSize: '14px', fontWeight: '600' }}>Baddiee in Tech</span>
            <span style={{ color: '#d4d4d8' }}>•</span>
            <span style={{ color: '#71717a', fontSize: '14px' }}>Full-time</span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{
                padding: '8px 20px',
                backgroundColor: 'white',
                color: '#09090b',
                border: '1.5px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              Message
            </button>
            <button
              style={{
                padding: '8px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share profile
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 2 — Edit Details ── */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1.5px solid #e4e4e7',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#09090b', margin: '0 0 20px 0' }}>
          Personal Information
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          {/* First Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>

          {/* Last Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>

          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>

          {/* Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>

           {/* Speical Day */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              Special Day 🎉
            </label>
            <input
              type="text"
              value={specialDay}
              onChange={(e) => setspecialDay(e.target.value)}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>

           {/* Gender */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>
              Gender
            </label>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>
        
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px',
            backgroundColor: saved ? '#22c55e' : '#09090b',
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
            gap: '6px',
          }}
          onMouseEnter={(e) => { if (!saved && !saving) e.currentTarget.style.backgroundColor = '#27272a'; }}
          onMouseLeave={(e) => { if (!saved && !saving) e.currentTarget.style.backgroundColor = '#09090b'; }}
        >
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}