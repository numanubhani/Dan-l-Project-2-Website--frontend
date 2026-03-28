import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { api } from '../services/api';

interface HomeLongVideosProps {
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
});

const formatViews = (views: number) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
};

const HomeLongVideos: React.FC<HomeLongVideosProps> = ({ user, onToggleSidebar, sidebarOpen = true }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getFeedVideos()
      .then((data: any[]) => setVideos(data.map(mapApiVideoToVideo)))
      .catch(() => setVideos([]))
      .finally(() => setIsLoading(false));
  }, []);

  const longVideos = useMemo(
    () => videos.filter((v) => v.type === 'long'),
    [videos]
  );

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

      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#FE2C55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/50 font-semibold">Loading videos…</p>
            </div>
          </div>
        ) : longVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/40 font-semibold mb-4">No videos yet. Be the first to upload!</p>
            <button onClick={() => navigate('/upload')} className="px-5 py-2.5 bg-[#FE2C55] text-white rounded-full font-bold text-sm hover:bg-[#e6254b] transition">
              Upload a video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {longVideos.map((video) => (
              <div
                key={video.id}
                className="cursor-pointer group"
                onClick={() => navigate(`/watch/${video.id}`)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-white/5 rounded-xl overflow-hidden mb-3">
                  <img
                    src={video.thumbnail || 'https://picsum.photos/seed/video/800/400'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Info row */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 shrink-0 overflow-hidden">
                    <img src={video.creatorAvatar || 'https://picsum.photos/seed/av/200'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug mb-1 group-hover:text-[#FE2C55] transition">
                      {video.title || 'Untitled'}
                    </h3>
                    <p className="text-xs text-white/50">{video.creatorName}</p>
                    <p className="text-xs text-white/35">{formatViews(video.views)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeLongVideos;

