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
import { SkeletonList } from '@/ui/skeleton';
import { Toggle } from '@/ui/toggle';

type Song = {
  id: string;
  title: string;
  url: string;
  videoId: string;
  playlistId: string;
  createdAt: any;
};

type Playlist = {
  id: string;
  name: string;
  createdAt: any;
};

// Extract YouTube video ID from various URL formats
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function MusicPage() {
  const [songs, setSongs]         = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [mounted, setMounted]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [playlistOpen, setPlaylistOpen] = useState(true);

  const [activePlaylist, setActivePlaylist] = useState<string>('all');
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);

  // Add song modal
  const [showAddSong, setShowAddSong] = useState(false);
  const [songUrl, setSongUrl]   = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [savingSong, setSavingSong] = useState(false);

  // Add playlist modal
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [savingPlaylist, setSavingPlaylist] = useState(false);

  useEffect(() => {
    setMounted(true);

    const qSongs = query(collection(db, 'music'), orderBy('createdAt', 'desc'));
    const unsubSongs = onSnapshot(qSongs, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Song[];
      setSongs(data);
      setLoading(false);
    });

    const qPlaylists = query(collection(db, 'playlists'), orderBy('createdAt', 'asc'));
    const unsubPlaylists = onSnapshot(qPlaylists, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Playlist[];
      setPlaylists(data);
    });

    return () => {
      unsubSongs();
      unsubPlaylists();
    };
  }, []);

  const handleAddPlaylist = async () => {
    if (!playlistName.trim()) return;
    setSavingPlaylist(true);
    try {
      await addDoc(collection(db, 'playlists'), {
        name: playlistName.trim(),
        createdAt: new Date(),
      });
      setPlaylistName('');
      setShowAddPlaylist(false);
    } catch (e: any) {
      console.error('❌ Error:', e.message);
    }
    setSavingPlaylist(false);
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!window.confirm('Delete this playlist? Songs will move to "All Songs".')) return;
    await deleteDoc(doc(db, 'playlists', id));
    if (activePlaylist === id) setActivePlaylist('all');
  };

  const handleAddSong = async () => {
    const videoId = extractVideoId(songUrl);
    if (!videoId) {
      alert('Invalid YouTube URL. Please paste a valid YouTube link.');
      return;
    }
    if (!songTitle.trim()) return;

    setSavingSong(true);
    try {
      await addDoc(collection(db, 'music'), {
        title: songTitle.trim(),
        url: songUrl.trim(),
        videoId,
        playlistId: activePlaylist === 'all' ? '' : activePlaylist,
        createdAt: new Date(),
      });
      setSongUrl('');
      setSongTitle('');
      setShowAddSong(false);
    } catch (e: any) {
      console.error('❌ Error:', e.message);
    }
    setSavingSong(false);
  };

  const handleDeleteSong = async (id: string) => {
    await deleteDoc(doc(db, 'music', id));
    if (nowPlaying?.id === id) setNowPlaying(null);
  };

  const handleMoveSong = async (id: string, playlistId: string) => {
    await updateDoc(doc(db, 'music', id), { playlistId });
  };

  // Filter songs by active playlist + search
  const filteredSongs = songs.filter((song) => {
    const matchesPlaylist = activePlaylist === 'all' || song.playlistId === activePlaylist;
    const matchesSearch = song.title.toLowerCase().includes(search.toLowerCase());
    return matchesPlaylist && matchesSearch;
  });

  if (!mounted) return null;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#fafafa',
        display: 'flex',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >

      {/* ── Left Sidebar — Playlists ── */}
      <div
        style={{
          width: playlistOpen ? '220px' : '60px',
          flexShrink: 0,
          backgroundColor: 'white',
          borderRight: '1px solid #e4e4e7',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 12px',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.25s ease',
        }}
      >
        {/* <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 12px' }}>
          Playlists
        </h2> */}

        {/* Playlists Sidebar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
          {playlistOpen && (
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Playlists
            </h2>
          )}
          <Toggle
            isOpen={playlistOpen}
            onToggle={() => setPlaylistOpen(!playlistOpen)}
            style={{ marginLeft: playlistOpen ? 'auto' : '0' }}
          />
        </div>

        {/* All Songs */}
        <button
          onClick={() => setActivePlaylist('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activePlaylist === 'all' ? '#f4f4f5' : 'transparent',
            color: '#09090b',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: '2px',
          }}
        >
          🎵 {playlistOpen && 'All Songs'}
          {playlistOpen && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#a1a1aa' }}>
              {songs.length}
            </span>
          )}
        </button>

        {/* Playlists */}
        {playlistOpen && playlists.map((playlist) => {
          const count = songs.filter((s) => s.playlistId === playlist.id).length;
          return (
            <div
              key={playlist.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                backgroundColor: activePlaylist === playlist.id ? '#f4f4f5' : 'transparent',
                marginBottom: '2px',
              }}
              onMouseEnter={(e) => {
                const del = e.currentTarget.querySelector('.playlist-delete') as HTMLElement;
                if (del) del.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const del = e.currentTarget.querySelector('.playlist-delete') as HTMLElement;
                if (del) del.style.opacity = '0';
              }}
            >
              <button
                onClick={() => setActivePlaylist(playlist.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#09090b',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  overflow: 'hidden',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playlist.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#a1a1aa', fontWeight: '500', flexShrink: 0 }}>
                  {count}
                </span>
              </button>
              <button
                className="playlist-delete"
                onClick={() => handleDeletePlaylist(playlist.id)}
                style={{
                  opacity: 0,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  padding: '6px',
                  display: 'flex',
                  transition: 'opacity 0.15s',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            </div>
          );
        })}

        {/* New Playlist */}
      {playlistOpen && (
          <button
          onClick={() => setShowAddPlaylist(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1.5px dashed #e4e4e7',
            backgroundColor: 'transparent',
            color: '#71717a',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '8px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a1a1aa'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Playlist
        </button>
      )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e4e4e7',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#09090b', margin: '0 0 4px 0' }}>
                🎶 {activePlaylist === 'all' ? 'All Songs' : playlists.find((p) => p.id === activePlaylist)?.name || 'Playlist'}
              </h1>
              <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
                {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>

            <button
              onClick={() => setShowAddSong(true)}
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
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Song
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search saved songs..."
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
                backgroundColor: '#fafafa',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
            />
          </div>
        </div>

        {/* Body — split into list + player */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Song List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {loading ? (
              <SkeletonList count={6} />
            ) : filteredSongs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#a1a1aa', gap: '8px' }}>
                <span style={{ fontSize: '40px' }}>🎵</span>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {search ? 'No songs match your search' : 'No songs yet. Click "Add Song" to get started!'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => setNowPlaying(song)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid',
                      borderColor: nowPlaying?.id === song.id ? '#09090b' : '#f4f4f5',
                      backgroundColor: nowPlaying?.id === song.id ? '#fafafa' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => { if (nowPlaying?.id !== song.id) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                    onMouseLeave={(e) => { if (nowPlaying?.id !== song.id) e.currentTarget.style.backgroundColor = 'white'; }}
                  >
                    {/* Thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                      alt={song.title}
                      style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    />

                    {/* Title */}
                    <p style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: '#09090b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.title}
                    </p>

                    {/* Now playing indicator */}
                    {nowPlaying?.id === song.id && (
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#09090b', flexShrink: 0 }}>▶ Playing</span>
                    )}

                    {/* Move to playlist */}
                    <select
                      value={song.playlistId || ''}
                      onChange={(e) => { e.stopPropagation(); handleMoveSong(song.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '8px',
                        border: '1.5px solid #e4e4e7',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#71717a',
                        backgroundColor: '#fafafa',
                        cursor: 'pointer',
                        outline: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <option value="">No playlist</option>
                      {playlists.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#d4d4d8',
                        padding: '4px',
                        display: 'flex',
                        flexShrink: 0,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#d4d4d8'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Player Panel */}
          <div
            style={{
              width: '450px',
              height: '600px',   //review this line of code
              flexShrink: 0,
              backgroundColor: 'white',
              borderLeft: '1px solid #e4e4e7',
              padding: '20px',
              overflowY: 'auto',
            }}
          >
            {nowPlaying ? (
              <>
                <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${nowPlaying.videoId}?autoplay=1`}
                    title={nowPlaying.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ display: 'block' }}
                  />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#09090b', margin: '0 0 4px 0' }}>
                  {nowPlaying.title}
                </h3>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#a1a1aa', gap: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '40px' }}>▶️</span>
                <p style={{ fontSize: '13px', margin: 0 }}>Click a song to play it here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Song Modal */}
      {showAddSong && (
        <div
          onClick={() => setShowAddSong(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#09090b', margin: 0 }}>🎵 Add Song</h2>
              <button
                onClick={() => setShowAddSong(false)}
                style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a', display: 'flex', padding: '4px', borderRadius: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>YouTube URL *</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  autoFocus
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', width: '100%' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Song Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Bohemian Rhapsody"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', width: '100%' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              {activePlaylist !== 'all' && (
                <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
                  📁 Will be added to: <strong>{playlists.find((p) => p.id === activePlaylist)?.name}</strong>
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  onClick={() => setShowAddSong(false)}
                  style={{ padding: '10px 20px', backgroundColor: 'white', color: '#09090b', border: '1.5px solid #e4e4e7', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSong}
                  disabled={savingSong || !songUrl.trim() || !songTitle.trim()}
                  style={{ padding: '10px 24px', backgroundColor: '#09090b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: savingSong ? 'not-allowed' : 'pointer', opacity: !songUrl.trim() || !songTitle.trim() ? 0.5 : 1 }}
                  onMouseEnter={(e) => { if (songUrl.trim() && songTitle.trim()) e.currentTarget.style.backgroundColor = '#27272a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
                >
                  {savingSong ? 'Adding...' : '+ Add Song'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Playlist Modal */}
      {showAddPlaylist && (
        <div
          onClick={() => setShowAddPlaylist(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#09090b', margin: 0 }}>📁 New Playlist</h2>
              <button
                onClick={() => setShowAddPlaylist(false)}
                style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a', display: 'flex', padding: '4px', borderRadius: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Playlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Road Trip Mix"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlaylist(); }}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', width: '100%' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddPlaylist(false)}
                  style={{ padding: '10px 20px', backgroundColor: 'white', color: '#09090b', border: '1.5px solid #e4e4e7', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlaylist}
                  disabled={savingPlaylist || !playlistName.trim()}
                  style={{ padding: '10px 24px', backgroundColor: '#09090b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: savingPlaylist ? 'not-allowed' : 'pointer', opacity: !playlistName.trim() ? 0.5 : 1 }}
                  onMouseEnter={(e) => { if (playlistName.trim()) e.currentTarget.style.backgroundColor = '#27272a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#09090b'; }}
                >
                  {savingPlaylist ? 'Creating...' : '+ Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}