import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { api, convertApiUserToUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import EditProfileModal from './EditProfileModal';

interface ProfileProps {
  user: User;
  onUserUpdate?: (user: User) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate, onToggleSidebar, sidebarOpen = true }) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'inbox' | 'reels' | 'shop' | 'video-live'>('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  const isOwnProfile = !id || id === currentUser?.id || id === user.id;
  const profileUserId = id || user.id;

  useEffect(() => {
    loadProfileData();
  }, [profileUserId]);

  useEffect(() => {
    if (activeTab === 'reels' || activeTab === 'video-live') {
      loadVideos();
    } else if (activeTab === 'inbox') {
      loadInbox();
    } else if (activeTab === 'shop') {
      loadShopItems();
    }
  }, [activeTab, profileUserId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await api.getUserProfile(profileUserId);
      setProfileData(data);
      setIsFollowing(data.is_following || false);
    } catch (err: any) {
      showError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      setVideosLoading(true);
      let videos;
      if (activeTab === 'reels') {
        videos = await api.getUserVideos(profileUserId, 'reels');
      } else if (activeTab === 'video-live') {
        videos = await api.getUserVideos(profileUserId, 'videos');
      } else {
        videos = await api.getUserVideos(profileUserId);
      }
      setUserVideos(videos);
    } catch (err: any) {
      showError(err.message || 'Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  };

  const loadInbox = async () => {
    if (!isOwnProfile) return;
    try {
      const messages = await api.getInbox();
      setInboxMessages(messages);
    } catch (err: any) {
      showError(err.message || 'Failed to load inbox');
    }
  };

  const loadShopItems = async () => {
    try {
      const items = await api.getUserShopItems(profileUserId);
      setShopItems(items);
    } catch (err: any) {
      showError(err.message || 'Failed to load shop items');
    }
  };

  const handleFollow = async () => {
    if (!isOwnProfile) {
      try {
        setFollowLoading(true);
        const result = await api.toggleFollow(profileUserId);
        setIsFollowing(result.is_following);
        showSuccess(result.is_following ? 'Followed!' : 'Unfollowed!');
        loadProfileData(); // Refresh to update counts
      } catch (err: any) {
        showError(err.message || 'Failed to follow/unfollow');
      } finally {
        setFollowLoading(false);
      }
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayData = profileData || {
    followers_count: 0,
    following_count: 0,
    videos_count: 0,
    name: user.name,
    avatar_url: user.avatar,
    bio: '',
    location: '',
  };

  return (
    <div className="w-full min-h-screen bg-white pb-20">
      {/* Hamburger Menu - When sidebar is hidden */}
      {!sidebarOpen && onToggleSidebar && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center p-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Tab Navigation - At top for non-profile tabs */}
      {activeTab !== 'profile' && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-around overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-bold">Profile</span>
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 relative shrink-0 ${
                  activeTab === 'inbox' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-bold">Inbox</span>
                {inboxMessages.filter((m: any) => !m.is_read).length > 0 && (
                  <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                activeTab === 'reels' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold">Reels</span>
            </button>
            <button
              onClick={() => setActiveTab('video-live')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                activeTab === 'video-live' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold">Video & Live</span>
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                activeTab === 'shop' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-[10px] font-bold">Shop</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Info Section */}
      {activeTab === 'profile' && (
        <div className="px-3 py-3">
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-2">
              <img
                src={displayData.avatar_url || user.avatar}
                alt={displayData.name || user.name}
                className="w-16 h-16 rounded-full border-2 border-purple-400"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-0.5">{displayData.name || user.name}</h2>
            <p className="text-xs text-gray-500 mb-1">@{profileData?.username || user.name.toLowerCase().replace(' ', '')}</p>
            {displayData.bio && (
              <p className="text-xs text-gray-600 text-center mb-2 px-4">{displayData.bio}</p>
            )}
            {displayData.location && (
              <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
                <span>{displayData.location}</span>
              </div>
            )}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 w-full mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold mb-0.5">Balance</p>
                  <p className="text-lg font-black text-purple-600">${user.balance.toLocaleString()}</p>
                </div>
                {isOwnProfile && (
                  <button 
                    onClick={() => {
                      if (user.balance < 10) {
                        showError('Minimum balance for withdraw is $10');
                      } else {
                        showSuccess('Withdrawal request submitted!');
                      }
                    }}
                    className="px-3 py-1.5 bg-purple-500 text-white rounded-lg font-bold text-xs hover:bg-purple-600 transition"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 w-full mb-4">
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">{displayData.videos_count || 0}</p>
                <p className="text-[10px] text-gray-500 font-bold">Videos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">
                  {displayData.followers_count >= 1000 
                    ? `${(displayData.followers_count / 1000).toFixed(1)}K` 
                    : displayData.followers_count || 0}
                </p>
                <p className="text-[10px] text-gray-500 font-bold">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">
                  {displayData.following_count >= 1000 
                    ? `${(displayData.following_count / 1000).toFixed(1)}K` 
                    : displayData.following_count || 0}
                </p>
                <p className="text-[10px] text-gray-500 font-bold">Following</p>
              </div>
            </div>

            {/* Edit Profile / Follow Button */}
            <div className="w-full mb-4">
              {isOwnProfile ? (
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-900 text-xs transition"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  } disabled:opacity-50`}
                >
                  {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-around border-t border-gray-200 bg-white w-full pt-3">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                  activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] font-bold">Profile</span>
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 relative shrink-0 ${
                    activeTab === 'inbox' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-bold">Inbox</span>
                  {inboxMessages.filter((m: any) => !m.is_read).length > 0 && (
                    <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab('reels')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                  activeTab === 'reels' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-bold">Reels</span>
              </button>
              <button
                onClick={() => setActiveTab('video-live')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                  activeTab === 'video-live' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-bold">Video & Live</span>
              </button>
              <button
                onClick={() => setActiveTab('shop')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-2 sm:px-3 shrink-0 ${
                  activeTab === 'shop' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-[10px] font-bold">Shop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inbox Section */}
      {activeTab === 'inbox' && isOwnProfile && (
        <div className="px-3 py-3">
          {inboxMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inboxMessages.map((message: any) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-xl border ${
                    !message.is_read ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <img
                      src={message.sender_avatar || 'https://picsum.photos/seed/user/200'}
                      alt={message.sender_name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-sm text-gray-900">{message.sender_name}</p>
                        <p className="text-[10px] text-gray-500">{formatTimeAgo(message.created_at)}</p>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">{message.message}</p>
                      {!message.is_read && (
                        <div className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reels/Videos Section */}
      {activeTab === 'reels' && (
        <div className="px-3 py-3">
          {videosLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading videos...</p>
            </div>
          ) : userVideos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No videos yet</p>
              {isOwnProfile && (
                <button 
                  onClick={() => navigate('/upload')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition"
                >
                  Create Your First Reel
                </button>
              )}
            </div>
          ) : (
            <div 
              className="overflow-x-auto scrollbar-hide pb-4 -mx-3 px-3" 
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex space-x-3" style={{ width: 'max-content' }}>
                {userVideos.map((video: any) => (
                  <div
                    key={video.id}
                    onClick={() => navigate(`/watch/${video.id}`)}
                    className="cursor-pointer group flex-shrink-0"
                    style={{ width: '172px' }}
                  >
                    {/* Shorts Thumbnail - Vertical */}
                    <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-2 shadow-sm" style={{ width: '172px', height: '304px' }}>
                      <img
                        src={video.thumbnail_url || video.thumbnail || 'https://picsum.photos/seed/video/400/800'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <svg className="w-7 h-7 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      {/* Preview Button for Owner */}
                      {isOwnProfile && video.bet_markers && video.bet_markers.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/watch/${video.id}?preview=true`);
                          }}
                          className="absolute top-2 left-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] px-2 py-1 rounded font-bold flex items-center space-x-1 shadow-lg transition z-10"
                          title="Preview with bet markers"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span>Preview</span>
                        </button>
                      )}
                      {/* Views Badge */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded font-semibold">
                          {video.views >= 1000000 
                            ? `${(video.views / 1000000).toFixed(1)}M`
                            : video.views >= 1000 
                            ? `${(video.views / 1000).toFixed(1)}K`
                            : video.views}
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
          )}
        </div>
      )}

      {/* Video & Live Section */}
      {activeTab === 'video-live' && (
        <div className="px-3 py-3">
          {videosLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading videos...</p>
            </div>
          ) : userVideos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No videos or live streams yet</p>
              {isOwnProfile && (
                <button 
                  onClick={() => navigate('/upload')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition"
                >
                  Upload Video
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userVideos.map((video: any) => (
                <div
                  key={video.id}
                  className="cursor-pointer group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail with Play Button */}
                  <div 
                    className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2"
                    onClick={() => navigate(`/watch/${video.id}`)}
                  >
                    <img
                      src={video.thumbnail_url || video.thumbnail || 'https://picsum.photos/seed/video/800/400'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <svg className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    {/* Preview Button for Owner */}
                    {isOwnProfile && video.bet_markers && video.bet_markers.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/watch/${video.id}?preview=true`);
                        }}
                        className="absolute top-2 left-2 bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded font-bold flex items-center space-x-1 shadow-lg transition"
                        title="Preview with bet markers"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>Preview</span>
                      </button>
                    )}
                    {/* Live Badge */}
                    {video.is_live && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    )}
                    {/* Duration/Type Badge */}
                    {!video.is_live && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        {video.video_type === 'short' ? 'Short' : 'Long'}
                      </div>
                    )}
                    {/* Views Badge */}
                    <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      {video.views >= 1000000 
                        ? `${(video.views / 1000000).toFixed(1)}M views`
                        : video.views >= 1000 
                        ? `${(video.views / 1000).toFixed(1)}K views`
                        : `${video.views} views`}
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{video.likes || 0} likes</span>
                      {isOwnProfile && video.bet_markers && video.bet_markers.length > 0 && (
                        <span className="text-purple-600 font-bold">
                          {video.bet_markers.length} bet{video.bet_markers.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shop Section */}
      {activeTab === 'shop' && (
        <div className="px-3 py-3">
          {shopItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No shop items yet</p>
              {isOwnProfile && (
                <button className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm">
                  List an Item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {shopItems.map((item: any) => (
                <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.image_url || item.image || 'https://picsum.photos/seed/shop/400'}
                      alt={item.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {item.status === 'active' ? 'Active' : item.status === 'sold' ? 'Sold' : 'Pending'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 mb-0.5">{item.title}</h3>
                    <p className="text-base font-black text-purple-600">${parseFloat(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onUserUpdate={(updatedUser) => {
            if (onUserUpdate) {
              onUserUpdate(updatedUser);
            }
            loadProfileData();
          }}
        />
      )}
    </div>
  );
};

export default Profile;
