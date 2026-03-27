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
    <div className="w-full min-h-screen">
      {/* Desktop Top Bar - YouTube Style */}
      <div className="hidden lg:flex sticky top-0 z-[9998] bg-black/60 backdrop-blur-xl border-b border-gray-200 h-16 items-center px-4 w-full">
        {/* Left Section - Hamburger + Logo when sidebar is closed */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {!sidebarOpen && (
            <>
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:opacity-80 transition"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-xl font-black italic text-white">V</span>
                </div>
                <span className="text-xl font-black tracking-tight text-gray-900 hidden md:inline">
                  VPULSE
                </span>
              </button>
            </>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 flex items-center justify-center max-w-3xl mx-8">
          <form className="w-full flex items-center" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2.5 pl-11 pr-4 border border-gray-300 rounded-l-full focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r-full transition flex items-center"
              aria-label="Search"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 flex items-center space-x-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Create"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Create</span>
          </button>
          <button
            className="p-2.5 rounded-full hover:bg-gray-100 transition relative"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-gray-200 transition"
            aria-label="Account menu"
          >
            {user ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </button>
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

