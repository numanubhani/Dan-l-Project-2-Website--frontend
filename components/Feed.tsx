import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, CommentIcon, ShareIcon } from './Icons';
import BettingOverlay from './BettingOverlay';
import { Video, User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const GUEST_USER: User = {
  id: '0',
  name: 'Guest',
  avatar: '',
  role: UserRole.VIEWER,
  balance: 0,
};

interface FeedProps {
  user?: User;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

// ─── VideoCard ─── only video + bottom info (no action bar — actions are rendered externally on desktop)
const VideoCard: React.FC<{
  video: Video;
  isActive: boolean;
  cardHeight: string;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onBet: () => void;
  showBettingOverlay: boolean;
  onCloseBetting: () => void;
  onPlaceEventBet: (eventId: string, optionId: string, amount: number) => Promise<void>;
  user: User;
}> = ({
  video, isActive, cardHeight,
  isLiked, onLike, onComment, onBet,
  showBettingOverlay, onCloseBetting, onPlaceEventBet,
  user,
}) => {
  const { requireAuth } = useAuth();
  const { showSuccess } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current && !isPaused) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive, isPaused]);

  useEffect(() => {
    if (!isActive) setIsPaused(false);
  }, [isActive]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
      setShowPauseIcon(true);
      setTimeout(() => setShowPauseIcon(false), 500);
    }
  };

  return (
    <div
      className="relative w-full snap-start snap-always overflow-hidden bg-black flex items-center justify-center cursor-pointer"
      style={{ height: cardHeight, maxHeight: cardHeight, minHeight: cardHeight, scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      onClick={togglePlayPause}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={video.thumbnail}
      />

      {/* Play/Pause feedback */}
      {showPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/30 p-5 rounded-full">
            {isPaused
              ? <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              : <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            }
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/75 pointer-events-none" />

      {/* MOBILE ONLY: action rail inside card */}
      <div
        className="lg:hidden absolute right-2 bottom-24 flex flex-col items-center space-y-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <img src={video.creatorAvatar || 'https://picsum.photos/seed/avatar/200'} className="w-12 h-12 rounded-full border-2 border-white" alt={video.creatorName} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pink-500 rounded-full p-0.5">
              <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
          </div>
        </div>

        <button onClick={() => requireAuth(onLike, 'like this video')} className="flex flex-col items-center">
          <div className={`p-2.5 rounded-full ${isLiked ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-white'} backdrop-blur-sm transition`}>
            <HeartIcon className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold mt-1 text-white drop-shadow">{(video.likes / 1000).toFixed(1)}K</span>
        </button>

        <button onClick={() => requireAuth(onComment, 'comment')} className="flex flex-col items-center">
          <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
            <CommentIcon className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold mt-1 text-white drop-shadow">{video.comments}</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
            <ShareIcon className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold mt-1 text-white drop-shadow">Share</span>
        </button>

        {video.betEvent && (
          <button onClick={() => requireAuth(onBet, 'place a bet')} className="flex flex-col items-center mt-1">
            <div className="p-3 rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/40 hover:bg-pink-600 transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
            </div>
            <span className="text-[10px] font-black mt-1 text-pink-400">BET</span>
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute left-4 bottom-20 right-4 pointer-events-none">
        <h4 className="text-white font-bold text-base mb-0.5 drop-shadow-lg">@{video.creatorName}</h4>
        <p className="text-white text-sm font-semibold line-clamp-2 mb-1 drop-shadow-lg">{video.title}</p>
        <p className="text-white/80 text-xs line-clamp-2 mb-1.5 drop-shadow-lg">{video.description}</p>
        <div className="flex items-center gap-2 text-white/70 text-xs drop-shadow-lg">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <span className="truncate">Original audio · {video.creatorName}</span>
        </div>
      </div>

      {/* Betting overlay */}
      {showBettingOverlay && video.betEvent && (
        <div onClick={(e) => e.stopPropagation()}>
          <BettingOverlay
            event={video.betEvent}
            user={user}
            onClose={onCloseBetting}
            onPlaceBet={async (optionId, amt) => {
              try {
                await onPlaceEventBet(String(video.betEvent!.id), optionId, amt);
                onCloseBetting();
              } catch (_) {}
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Desktop Action Rail ─── rendered to the right of the video column
const DesktopActionRail: React.FC<{
  video: Video | null;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onBet: () => void;
}> = ({ video, isLiked, onLike, onComment, onBet }) => {
  const { requireAuth } = useAuth();

  if (!video) return <div className="hidden lg:block w-16" />;

  return (
    <div className="hidden lg:flex flex-col items-center justify-center gap-5 pl-4 self-center">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={video.creatorAvatar || 'https://picsum.photos/seed/avatar/200'}
            className="w-12 h-12 rounded-full border-2 border-white/80 shadow-lg"
            alt={video.creatorName}
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pink-500 rounded-full p-0.5 shadow">
            <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
        </div>
      </div>

      {/* Like */}
      <button
        onClick={() => requireAuth(onLike, 'like this video')}
        className="flex flex-col items-center gap-1 group"
      >
        <div className={`p-3 rounded-full transition-all ${isLiked ? 'bg-red-500/20 text-red-400 scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`}>
          <HeartIcon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-white/80">{(video.likes / 1000).toFixed(1)}K</span>
      </button>

      {/* Comment */}
      <button
        onClick={() => requireAuth(onComment, 'comment')}
        className="flex flex-col items-center gap-1 group"
      >
        <div className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
          <CommentIcon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-white/80">{video.comments}</span>
      </button>

      {/* Share */}
      <button className="flex flex-col items-center gap-1 group">
        <div className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
          <ShareIcon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-white/80">Share</span>
      </button>

      {/* Bet */}
      {video.betEvent && (
        <button
          onClick={() => requireAuth(onBet, 'place a bet')}
          className="flex flex-col items-center gap-1 group mt-1"
        >
          <div className="p-3 rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/40 hover:bg-pink-600 transition-all">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <span className="text-[10px] font-black text-pink-400">BET LIVE</span>
        </button>
      )}
    </div>
  );
};

// ─── Feed ───────────────────────────────────────────────────────────────────
const Feed: React.FC<FeedProps> = ({ user, onToggleSidebar, sidebarOpen = true }) => {
  const { user: authUser, isAuthenticated, showLoginModal } = useAuth();
  const displayUser = user ?? authUser ?? GUEST_USER;
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Per-video interaction state lifted to parent (needed by external action rail)
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [bettingVideoId, setBettingVideoId] = useState<string | null>(null);

  const [containerHeight, setContainerHeight] = useState('100vh');
  const [cardHeight, setCardHeight] = useState('100vh');
  const [topOffset, setTopOffset] = useState('0px');

  useEffect(() => {
    const updateHeight = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        // Sticky nav is in-flow — it already pushes content down, no marginTop needed.
        // Height = viewport minus the sticky navbar height.
        const available = window.innerHeight - 56;
        setContainerHeight(`${available}px`);
        setCardHeight(`${available}px`);
        setTopOffset('0px');
      } else {
        // Fixed nav (top 56px) + fixed bottom nav (55px) — need explicit marginTop.
        const available = window.innerHeight - 56 - 55;
        setContainerHeight(`${available}px`);
        setCardHeight(`${available}px`);
        setTopOffset('56px');
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const h = parseInt(cardHeight, 10) || window.innerHeight;
      const index = Math.round(containerRef.current.scrollTop / h);
      setActiveIndex(index);
    }
  };

  // Feed data — refetch when auth state changes so a new session picks up /videos/feed/
  const [feedVideos, setFeedVideos] = useState<Video[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    setFeedVideos(null);
    api
      .getFeedVideos()
      .then((data: any[]) => {
        if (cancelled) return;
        const mapped: Video[] = data.map((v: any) => ({
          id: String(v.id),
          creatorId: String(v.creator ?? ''),
          creatorName: v.creator_name || 'Creator',
          creatorAvatar: v.creator_avatar || '',
          title: v.title || '',
          description: v.description || '',
          url: v.video_file_url || v.video_url || '',
          thumbnail: v.thumbnail_url || v.thumbnail || '',
          views: v.views || 0,
          likes: v.likes || 0,
          comments: v.comments || 0,
          type: (v.video_type === 'short' ? 'short' : v.video_type === 'live' ? 'live' : 'long') as 'short' | 'long' | 'live',
          betMarkers: (v.bet_markers || []).map((m: any) => ({
            id: String(m.id), timestamp: m.timestamp, question: m.question,
            options: (m.options || []).map((o: any) => ({ id: String(o.id), text: o.text, odds: Number(o.odds) })),
            totalPool: m.total_pool || 0, participants: m.participants || 0,
          })),
          ...(v.bet_event && {
            betEvent: {
              id: String(v.bet_event.id), question: v.bet_event.question,
              options: (v.bet_event.options || []).map((o: any) => ({ id: String(o.id), text: o.text, odds: Number(o.odds) })),
              totalPool: v.bet_event.totalPool ?? 0,
              participants: v.bet_event.participants ?? 0,
              expiresAt: v.bet_event.expiresAt ?? Date.now() + 60000,
            },
          }),
        }));
        setFeedVideos(mapped);
      })
      .catch(() => {
        if (!cancelled) setFeedVideos([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, authUser?.id, isAuthenticated]);

  const videosToShow = (feedVideos ?? []).slice(0, 20);
  const feedLoading = feedVideos === null;

  const activeVideo = videosToShow[activeIndex] ?? null;
  const isActiveLiked = activeVideo ? likedVideos.has(activeVideo.id) : false;

  const handleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) { next.delete(videoId); showSuccess('Removed from likes'); }
      else { next.add(videoId); showSuccess('Liked!'); }
      return next;
    });
  };

  const [activeNavItem, setActiveNavItem] = useState('For You');

  return (
    <div className="w-full min-h-screen bg-black relative">

      {/* ── Desktop Top Navbar ── */}
      <div className="hidden lg:flex sticky top-0 z-[9998] bg-black/70 backdrop-blur-xl border-b border-white/10 h-14 items-center px-3 gap-2 w-full min-w-0">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2 shrink-0">
          {!sidebarOpen && (
            <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Open sidebar">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-base font-black italic text-white">V</span>
            </div>
            <span className="text-base font-black tracking-tight text-white hidden xl:inline">VPULSE</span>
          </button>
        </div>

        {/* Center: search — flex-1 with min-w-0 so it compresses properly */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex items-center w-full max-w-xl min-w-0">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search"
                className="w-full min-w-0 pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-l-full text-white text-sm placeholder-white/40 focus:outline-none focus:border-fuchsia-500 transition"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button type="button" className="px-4 py-2 bg-white/10 border border-l-0 border-white/20 rounded-r-full text-white/60 hover:text-white hover:bg-white/20 transition shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="p-2 rounded-lg hover:bg-white/10 transition text-white/70 hover:text-white hidden xl:flex" aria-label="Voice search">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <button onClick={() => navigate('/create')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition text-sm font-medium shrink-0">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xl:inline">Create</span>
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10 transition text-white/70 hover:text-white relative" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-black"></div>
          </button>

          <button onClick={() => navigate('/profile')} className="p-0.5 rounded-full hover:ring-2 hover:ring-fuchsia-500/50 transition" aria-label="Profile">
            {user ? (
              <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Sticky Top Navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-[9998] bg-black/70 backdrop-blur-xl border-b border-white/10 lg:hidden">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="shrink-0 pl-2 pr-2 py-3 flex flex-col items-center justify-center gap-0.5 border-r border-white/10 text-white/85 hover:text-white active:scale-95 transition min-w-[3rem]"
            aria-label="Back to home — browse grid"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-wide leading-none opacity-90">Home</span>
          </button>

          <button
            onClick={() => setActiveNavItem('Live')}
            className={`shrink-0 px-3 py-3 flex items-center gap-1.5 transition ${activeNavItem === 'Live' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white/60'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-bold text-sm whitespace-nowrap">Live</span>
          </button>

          <div className="flex items-center overflow-x-auto scrollbar-hide flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
            {['Stem', 'Explore', 'Following', 'Friend', 'For You'].map(item => (
              <button
                key={item}
                onClick={() => setActiveNavItem(item)}
                className={`shrink-0 px-4 py-3 font-bold text-sm whitespace-nowrap transition ${
                  activeNavItem === item ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white/60'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="shrink-0 flex items-center border-l border-white/10">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => showLoginModal('continue')}
                className="mx-2 px-3 py-1.5 rounded-full bg-[#FE2C55] hover:bg-[#e6254b] text-white text-xs font-bold whitespace-nowrap transition"
              >
                Log in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="mx-2 p-0.5 rounded-full ring-1 ring-white/20 hover:ring-fuchsia-500/50 transition"
                aria-label="Profile"
              >
                {displayUser.avatar ? (
                  <img src={displayUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </button>
            )}
            <button
              type="button"
              className="p-3 pr-3 border-l border-white/10"
              aria-label="Search"
            >
              <span className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition inline-flex">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main: phone-width column + desktop action rail side-by-side ── */}
      <div
        className="w-full flex items-start justify-center bg-black"
        style={{ height: containerHeight, marginTop: topOffset }}
      >
        {/* Video scroll column */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full lg:w-[390px] lg:shrink-0 h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black lg:rounded-2xl lg:ring-1 lg:ring-white/10 lg:shadow-[0_0_60px_rgba(0,0,0,0.7)]"
          style={{
            scrollSnapType: 'y mandatory',
            scrollSnapStop: 'always',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {feedLoading ? (
            <div
              className="w-full flex items-center justify-center bg-black snap-start"
              style={{ height: cardHeight, minHeight: cardHeight }}
            >
              <div className="text-center px-6">
                <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/50 text-sm font-medium">Loading feed…</p>
              </div>
            </div>
          ) : videosToShow.length === 0 ? (
            <div
              className="w-full flex items-center justify-center bg-black snap-start px-6"
              style={{ height: cardHeight, minHeight: cardHeight }}
            >
              <div className="text-center max-w-sm">
                <p className="text-white font-bold text-lg mb-2">No videos yet</p>
                <p className="text-white/50 text-sm mb-6">
                  {isAuthenticated
                    ? 'Your feed is empty. Check back later or explore creators.'
                    : 'Sign in to load your personalized feed from the server.'}
                </p>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => showLoginModal('see your feed')}
                    className="px-6 py-3 rounded-full bg-[#FE2C55] hover:bg-[#e6254b] text-white font-bold text-sm transition"
                  >
                    Log in
                  </button>
                )}
              </div>
            </div>
          ) : (
            videosToShow.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={activeIndex === i}
                cardHeight={cardHeight}
                isLiked={likedVideos.has(video.id)}
                onLike={() => handleLike(video.id)}
                onComment={() => showSuccess('Comment feature coming soon!')}
                onBet={() => setBettingVideoId(video.id)}
                showBettingOverlay={bettingVideoId === video.id}
                onCloseBetting={() => setBettingVideoId(null)}
                onPlaceEventBet={async (eventId, optionId, amt) => {
                  try {
                    await api.placeEventBet(eventId, optionId, amt);
                    showSuccess(`Bet placed: $${amt}`);
                  } catch (err: any) {
                    showError(err.message || 'Failed to place bet');
                  }
                }}
                user={displayUser}
              />
            ))
          )}

          {!feedLoading && videosToShow.length > 0 && (
            <div
              className="w-full flex items-center justify-center bg-black snap-start"
              style={{ height: cardHeight, minHeight: cardHeight }}
            >
              <div className="text-center">
                <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-white/50 text-sm font-medium">Loading more...</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop-only action rail — outside the video column */}
        <DesktopActionRail
          video={activeVideo}
          isLiked={isActiveLiked}
          onLike={() => activeVideo && handleLike(activeVideo.id)}
          onComment={() => showSuccess('Comment feature coming soon!')}
          onBet={() => activeVideo && setBettingVideoId(activeVideo.id)}
        />
      </div>
    </div>
  );
};

export default Feed;
