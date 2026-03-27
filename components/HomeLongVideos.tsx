import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { api } from '../services/api';

interface HomeLongVideosProps {
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

const HomeLongVideos: React.FC<HomeLongVideosProps> = ({ onToggleSidebar, sidebarOpen = true }) => {
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
    <div className="w-full min-h-screen">
      {/* Desktop Top Bar */}
      <div className="hidden lg:flex sticky top-0 z-[9998] bg-black/60 backdrop-blur-xl border-b border-gray-200 h-16 items-center px-4 w-full">
        <div className="flex items-center space-x-3 flex-shrink-0">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <button onClick={() => navigate('/')} className="flex items-center space-x-2 hover:opacity-80 transition">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl font-black italic text-white">V</span>
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 hidden md:inline">VPULSE</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl w-full">
            <h1 className="text-base font-black text-gray-900">Home</h1>
            <p className="text-xs text-gray-500">All long videos uploaded by users</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="w-full flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-bold">Loading videos...</p>
            </div>
          </div>
        ) : longVideos.length === 0 ? (
          <div className="neon-surface p-10 text-center">
            <p className="text-gray-500 font-bold">No long videos yet.</p>
            <button
              className="mt-4 px-5 py-2.5 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition"
              onClick={() => navigate('/upload')}
            >
              Upload a video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {longVideos.map((video) => (
              <div
                key={video.id}
                className="cursor-pointer group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate(`/watch/${video.id}`)}
              >
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={video.thumbnail || 'https://picsum.photos/seed/video/800/400'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">{video.creatorName}</p>
                  <p className="text-xs text-gray-500">{formatViews(video.views)}</p>
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

