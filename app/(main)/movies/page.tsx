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

type Movie = {
  id: string;
  title: string;
  genre: string;
  poster: string;
  rating: number;
  status: 'up_next' | 'watching' | 'backlog' | 'watched' | 'favorite';
  createdAt: any;
};

type TMDBResult = {
  id: number;
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
};

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const SECTIONS: { key: Movie['status']; label: string; icon: JSX.Element }[] = [
  {
    key: 'up_next',
    label: 'Up Next',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  {
    key: 'watching',
    label: 'Watching',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    key: 'backlog',
    label: 'Backlog',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    key: 'watched',
    label: 'Watched',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    key: 'favorite',
    label: 'Favorites',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
];

export default function MoviesPage() {
  const [movies, setMovies]       = useState<Movie[]>([]);
  const [mounted, setMounted]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab]             = useState<'search' | 'manual'>('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Manual entry state
  const [manualTitle, setManualTitle]   = useState('');
  const [manualGenre, setManualGenre]   = useState('');
  const [manualPoster, setManualPoster] = useState('');
  const [manualRating, setManualRating] = useState(0);

  const [pendingStatus, setPendingStatus] = useState<Movie['status']>('up_next');
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Movie[];
      setMovies(data);
    });
    return () => unsubscribe();
  }, []);

  // Live search TMDB as user types
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data.results?.slice(0, 8) || []);
      } catch (e: any) {
        console.error('TMDB search error:', e.message);
      }
      setSearching(false);
    }, 400);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  const handleAddFromSearch = async (movie: TMDBResult) => {
    setSaving(true);
    try {
      const genre = movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean).join(', ') || 'Unknown';
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : '';

      await addDoc(collection(db, 'movies'), {
        title: movie.title,
        genre,
        poster,
        rating: Math.round((movie.vote_average / 2) * 10) / 10, // convert 10 → 5 star scale
        status: pendingStatus,
        createdAt: new Date(),
      });

      setSearchQuery('');
      setSearchResults([]);
      setShowModal(false);
    } catch (e: any) {
      console.error('❌ Error:', e.message);
    }
    setSaving(false);
  };

  const handleAddManual = async () => {
    if (!manualTitle.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'movies'), {
        title: manualTitle.trim(),
        genre: manualGenre.trim() || 'Unknown',
        poster: manualPoster.trim(),
        rating: manualRating,
        status: pendingStatus,
        createdAt: new Date(),
      });

      setManualTitle('');
      setManualGenre('');
      setManualPoster('');
      setManualRating(0);
      setShowModal(false);
    } catch (e: any) {
      console.error('Error:', e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'movies', id));
  };

  const handleStatusChange = async (id: string, status: Movie['status']) => {
    await updateDoc(doc(db, 'movies', id), { status });
  };

  const handleRatingChange = async (id: string, rating: number) => {
    await updateDoc(doc(db, 'movies', id), { rating });
  };

  const openAddModal = (status: Movie['status']) => {
    setPendingStatus(status);
    setShowModal(true);
    setTab('search');
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
          borderBottom: '1px solid #e4e4e7',
          flexShrink: 0,
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#09090b', margin: '0 0 4px 0' }}>
          🎬 Watchlist
        </h1>
        <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
          {movies.length} {movies.length === 1 ? 'movie' : 'movies'} total
        </p>
      </div>

      {/* Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', boxSizing: 'border-box' }}>
        {SECTIONS.map((section) => {
          const sectionMovies = movies.filter((m) => m.status === section.key);
          return (
            <div key={section.key} style={{ marginBottom: '32px' }}>
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#09090b' }}>{section.icon}</span>
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#09090b', margin: 0 }}>
                    {section.label}
                  </h2>
                  <span
                    style={{
                      backgroundColor: '#f4f4f5',
                      color: '#71717a',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}
                  >
                    {sectionMovies.length}
                  </span>
                </div>

                {/* Add button */}
                <button
                  onClick={() => openAddModal(section.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: 'white',
                    border: '1.5px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#09090b',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add
                </button>
              </div>

              {/* Movie Grid */}
              {sectionMovies.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#a1a1aa',
                    fontSize: '13px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1.5px dashed #e4e4e7',
                  }}
                >
                  No movies here yet
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {sectionMovies.map((movie) => (
                    <div
                      key={movie.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1.5px solid #f4f4f5',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        position: 'relative',
                        transition: 'box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                    >
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(movie.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
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
                        className="movie-delete-btn"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>

                      {/* Poster */}
                      <div
                        style={{
                          height: '220px',
                          backgroundColor: '#f4f4f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '40px' }}>🎬</span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '10px 12px 12px 12px' }}>
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#09090b',
                            margin: '0 0 4px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={movie.title}
                        >
                          {movie.title}
                        </p>
                        <p
                          style={{
                            fontSize: '11px',
                            color: '#a1a1aa',
                            margin: '0 0 8px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {movie.genre}
                        </p>

                        {/* Star rating */}
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => handleRatingChange(movie.id, star)}
                              style={{
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: star <= movie.rating ? '#f59e0b' : '#e4e4e7',
                                lineHeight: 1,
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        {/* Status selector */}
                        <select
                          value={movie.status}
                          onChange={(e) => handleStatusChange(movie.id, e.target.value as Movie['status'])}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: '1.5px solid #e4e4e7',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#71717a',
                            backgroundColor: '#fafafa',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          {SECTIONS.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Movie Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '24px',
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
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#09090b', margin: 0 }}>
                🎬 Add to {SECTIONS.find((s) => s.key === pendingStatus)?.label}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a', padding: '4px', borderRadius: '6px', display: 'flex' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1.5px solid #f4f4f5' }}>
              <button
                onClick={() => setTab('search')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: tab === 'search' ? '2px solid #09090b' : '2px solid transparent',
                  color: tab === 'search' ? '#09090b' : '#a1a1aa',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '-1.5px',
                }}
              >
                🔍 Search
              </button>
              <button
                onClick={() => setTab('manual')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: tab === 'manual' ? '2px solid #09090b' : '2px solid transparent',
                  color: tab === 'manual' ? '#09090b' : '#a1a1aa',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '-1.5px',
                }}
              >
                ✏️ Manual Entry
              </button>
            </div>

            {/* Search Tab */}
            {tab === 'search' && (
              <div>
                <input
                  type="text"
                  placeholder="Search for a movie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #e4e4e7',
                    fontSize: '14px',
                    color: '#09090b',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    boxSizing: 'border-box',
                    marginBottom: '16px',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                />

                {searching && (
                  <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>Searching...</p>
                )}

                {!searching && searchResults.length === 0 && searchQuery && (
                  <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>No results found</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => handleAddFromSearch(movie)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '8px',
                        borderRadius: '10px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        border: '1.5px solid #f4f4f5',
                        opacity: saving ? 0.5 : 1,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ width: '50px', height: '75px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f4f4f5', flexShrink: 0 }}>
                        {movie.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#09090b', margin: '0 0 4px 0' }}>
                          {movie.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
                          {movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean).join(', ')}
                        </p>
                        <p style={{ fontSize: '12px', color: '#f59e0b', margin: '4px 0 0 0' }}>
                          ★ {(movie.vote_average / 2).toFixed(1)} / 5
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Tab */}
            {tab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Title *</label>
                  <input
                    type="text"
                    placeholder="Movie title"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', width: '100%' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Genre</label>
                  <input
                    type="text"
                    placeholder="e.g. Action, Drama"
                    value={manualGenre}
                    onChange={(e) => setManualGenre(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', width: '100%' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Poster Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={manualPoster}
                    onChange={(e) => setManualPoster(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', width: '100%' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#09090b'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
                  />
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setManualRating(star)}
                        style={{ cursor: 'pointer', fontSize: '24px', color: star <= manualRating ? '#f59e0b' : '#e4e4e7' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddManual}
                  disabled={saving || !manualTitle.trim()}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#09090b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: !manualTitle.trim() ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Adding...' : '+ Add Movie'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        div:hover > .movie-delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}