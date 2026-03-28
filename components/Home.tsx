import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { api } from '../services/api';

interface HomeProps {
  user?: any;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const mapApiVideoToVideo = (v: any): Video => ({
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
    id: String(m.id),
    timestamp: m.timestamp,
    question: m.question,
    options: (m.options || []).map((o: any) => ({ id: String(o.id), text: o.text, odds: Number(o.odds) })),
    totalPool: m.total_pool || 0,
    participants: m.participants || 0,
  })),
  ...(v.bet_event && {
    betEvent: {
      id: String(v.bet_event.id),
      question: v.bet_event.question,
      options: (v.bet_event.options || []).map((o: any) => ({ id: String(o.id), text: o.text, odds: Number(o.odds) })),
      totalPool: v.bet_event.totalPool ?? 0,
      participants: v.bet_event.participants ?? 0,
      expiresAt: v.bet_event.expiresAt ?? 0,
    },
  }),
});

const Home: React.FC<HomeProps> = ({ user, onToggleSidebar, sidebarOpen = true }) => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getFeedVideos()
      .then((data: any[]) => {
        setVideos(data.map(mapApiVideoToVideo));
      })
      .catch(() => setVideos([]))
      .finally(() => setIsLoading(false));
  }, []);

  const shorts = videos.filter(video => video.type === 'short');
  const regularVideos = videos.filter(video => video.type === 'long' || video.type === 'live');

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    navigate(`/watch/${video.id}`);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f]">
      {/* ── Desktop Top Bar ── */}
      <div className="hidden lg:flex sticky top-0 z-[9998] h-14 items-center gap-2 px-3 bg-[#0f0f0f] border-b border-white/[0.08] w-full">

        {/* Left: hamburger when sidebar closed */}
        {!sidebarOpen && (
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-white/10 transition shrink-0" aria-label="Open sidebar">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Center: search */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex items-center w-full max-w-xl min-w-0">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search"
                className="w-full min-w-0 pl-10 pr-3 py-2 bg-white/[0.07] border border-white/[0.12] rounded-l-full text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#FE2C55]/60 transition"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/[0.07] border border-l-0 border-white/[0.12] rounded-r-full text-white/60 hover:text-white hover:bg-white/[0.12] transition shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: create + notifications + profile/login */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => navigate('/create')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.15] text-white/80 hover:bg-white/10 hover:text-white transition text-sm font-medium">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xl:inline">Create</span>
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10 transition text-white/70 hover:text-white relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FE2C55] rounded-full ring-2 ring-[#0f0f0f]" />
          </button>

          {user ? (
            <button onClick={() => navigate('/profile')} className="p-0.5 rounded-full hover:ring-2 hover:ring-[#FE2C55]/50 transition ml-1">
              <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="ml-1 px-4 py-1.5 rounded-full border-2 border-[#FE2C55] text-[#FE2C55] font-bold text-sm hover:bg-[#FE2C55]/10 transition">
              Log in
            </button>
          )}
        </div>
      </div>

      {/* Main Content - YouTube Style */}
      <div className="pt-14 lg:pt-0">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${sidebarOpen ? 'max-w-7xl' : 'max-w-full'}`}>
          {/* Loading / Empty States */}
          {isLoading && (
            <div className="py-16 text-center text-gray-500 font-medium neon-surface">
              Loading videos...
            </div>
          )}
          {!isLoading && videos.length === 0 && (
            <div className="py-16 text-center text-gray-500 font-medium neon-surface">
              No videos yet. Be the first to upload!
            </div>
          )}
          {/* Shorts Section */}
          {shorts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.77 10.32c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.06-1.42-.92-2.67-2.21-3.25zM10 14.65v-5.3L15 12l-5 2.65z"/>
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Shorts</h2>
              </div>
              <div 
                className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4" 
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div className="flex space-x-3" style={{ width: 'max-content' }}>
                  {shorts.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoClick(video)}
                      className="cursor-pointer group flex-shrink-0"
                      style={{ width: '172px' }}
                    >
                      {/* Shorts Thumbnail - Vertical */}
                      <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-2 shadow-sm" style={{ width: '172px', height: '304px' }}>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded font-semibold">
                            {formatViews(video.views)}
                          </div>
                        </div>
                      </div>
                      {/* Shorts Title */}
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-purple-600 transition px-1">
                        {video.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Regular Videos Grid */}
          {regularVideos.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {regularVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="cursor-pointer group neon-surface p-3"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        {video.type === 'live' ? 'LIVE' : '10:30'}
                      </div>
                      {video.type === 'live' && (
                        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>LIVE</span>
                        </div>
                      )}
                      {/* Menu Button (Three Dots) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle menu click
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="More options"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Video Info */}
                    <div className="flex space-x-3">
                      <img
                        src={video.creatorAvatar}
                        alt={video.creatorName}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-purple-600 transition">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {video.creatorName}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                          <span>{formatViews(video.views)}</span>
                          <span>•</span>
                          <span>{timeAgo(Date.now() - Math.random() * 86400000 * 30)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

