import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_VIDEOS } from '../constants';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'inbox' | 'reels' | 'marketplace'>('profile');
  const [inboxMessages] = useState([
    { id: '1', from: 'Sarah Johnson', message: 'Hey! Interested in your iPhone listing', time: '2h ago', unread: true },
    { id: '2', from: 'Mike Davis', message: 'Can we meet today?', time: '5h ago', unread: true },
    { id: '3', from: 'Emma Wilson', message: 'Thanks for the quick response!', time: '1d ago', unread: false },
    { id: '4', from: 'David Lee', message: 'Is the item still available?', time: '2d ago', unread: false },
  ]);

  // Get user's videos/reels
  const userVideos = MOCK_VIDEOS.filter(video => video.creatorId === user.id || video.creatorName === user.name);

  // Mock marketplace items
  const marketplaceItems = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max 256GB',
      price: '$899',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      status: 'active'
    },
    {
      id: '2',
      title: 'MacBook Pro 14" M3',
      price: '$1,599',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      status: 'sold'
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white pb-20">
      {/* Tab Navigation - At top for non-profile tabs */}
      {activeTab !== 'profile' && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-3 ${
                activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-bold">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-3 relative ${
                activeTab === 'inbox' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold">Inbox</span>
              {inboxMessages.filter(m => m.unread).length > 0 && (
                <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-3 ${
                activeTab === 'reels' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold">Reels</span>
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex flex-col items-center space-y-0.5 py-2 px-3 ${
                activeTab === 'marketplace' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-[10px] font-bold">Marketplace</span>
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
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-purple-400"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-0.5">{user.name}</h2>
            <p className="text-xs text-gray-500 mb-3">@{user.name.toLowerCase().replace(' ', '')}</p>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 w-full mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold mb-0.5">Balance</p>
                  <p className="text-lg font-black text-purple-600">${user.balance.toLocaleString()}</p>
                </div>
                <button className="px-3 py-1.5 bg-purple-500 text-white rounded-lg font-bold text-xs">
                  Withdraw
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 w-full mb-4">
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">{userVideos.length}</p>
                <p className="text-[10px] text-gray-500 font-bold">Videos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">1.2K</p>
                <p className="text-[10px] text-gray-500 font-bold">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">450</p>
                <p className="text-[10px] text-gray-500 font-bold">Following</p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-900 text-sm transition mb-4">
              Edit Profile
            </button>

            {/* Tab Navigation */}
            <div className="flex items-center justify-around border-t border-gray-200 bg-white w-full pt-3">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-3 ${
                  activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] font-bold">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-3 relative ${
                  activeTab === 'inbox' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-bold">Inbox</span>
                {inboxMessages.filter(m => m.unread).length > 0 && (
                  <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reels')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-3 ${
                  activeTab === 'reels' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-bold">Reels</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`flex flex-col items-center space-y-0.5 py-2 px-3 ${
                  activeTab === 'marketplace' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-[10px] font-bold">Marketplace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inbox Section */}
      {activeTab === 'inbox' && (
        <div className="px-3 py-3">
          <div className="space-y-2">
            {inboxMessages.map(message => (
              <div
                key={message.id}
                className={`p-3 rounded-xl border ${
                  message.unread ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-xs">
                      {message.from.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-sm text-gray-900">{message.from}</p>
                      <p className="text-[10px] text-gray-500">{message.time}</p>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{message.message}</p>
                    {message.unread && (
                      <div className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reels/Videos Section */}
      {activeTab === 'reels' && (
        <div className="px-3 py-3">
          {userVideos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No videos yet</p>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm">
                Create Your First Reel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {userVideos.map(video => (
                <div key={video.id} className="relative aspect-[9/16] rounded-md overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                    <div className="flex items-center space-x-1 text-white text-[10px]">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span>{(video.views / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Marketplace Section */}
      {activeTab === 'marketplace' && (
        <div className="px-3 py-3">
          {marketplaceItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No marketplace items yet</p>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm">
                List an Item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {marketplaceItems.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {item.status === 'active' ? 'Active' : 'Sold'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 mb-0.5">{item.title}</h3>
                    <p className="text-base font-black text-purple-600">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;

