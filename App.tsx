
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Feed from './components/Feed';
import Home from './components/Home';
import VideoPlayer from './components/VideoPlayer';
import CreatorDashboard from './components/CreatorDashboard';
import AdminPanel from './components/AdminPanel';
import LiveStream from './components/LiveStream';
import PredictionMarket from './components/PredictionMarket';
import Notifications from './components/Notifications';
import CameraView from './components/CameraView';
import Shop from './components/Shop';
import Profile from './components/Profile';
import { MOCK_USER } from './constants';
import { UserRole, Notification } from './types';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(MOCK_USER);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  // Hide sidebar by default when on video player route
  const isVideoPlayerRoute = location.pathname.startsWith('/watch/');
  const [sidebarOpen, setSidebarOpen] = useState(!isVideoPlayerRoute);

  // Update sidebar state when route changes
  useEffect(() => {
    if (isVideoPlayerRoute) {
      setSidebarOpen(false);
    }
  }, [isVideoPlayerRoute]);
  const [notifications] = useState<Notification[]>([
    { id: '1', message: 'You won 450 coins on "Triple Backflip Attempt"!', type: 'bet_win', timestamp: Date.now() - 3600000 },
    { id: '2', message: 'New video from ExtremeSports: "Death Dive"', type: 'new_video', timestamp: Date.now() - 7200000 },
    { id: '3', message: 'Bet lost: "ChefMaster Challenge"', type: 'bet_loss', timestamp: Date.now() - 86400000 },
  ]);

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/reel' || path === '/feed') return 'reel';
    if (path === '/shop') return 'shop';
    if (path === '/market' || path === '/polymarket') return 'polymarket';
    if (path === '/explore') return 'explore';
    if (path === '/creator') return 'creator';
    if (path === '/live') return 'live';
    if (path === '/create') return 'creator';
    if (path === '/profile') return 'profile';
    return 'home'; // default to home
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col lg:flex-row relative">
      {/* Sidebar - Desktop - Hidden on video player route by default */}
      <nav className={`hidden lg:flex flex-col w-60 h-screen border-r border-gray-200 bg-white ${sidebarOpen ? 'sticky' : 'fixed'} top-0 overflow-y-auto sidebar-scrollbar transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-400/40">
                <span className="text-2xl font-black italic text-white">V</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">VPULSE</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-900"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="space-y-1 mb-6">
          {[
            { id: 'home', path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'reel', path: '/reel', label: 'Reel', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
            { id: 'shop', path: '/shop', label: 'Shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
            { id: 'polymarket', path: '/polymarket', label: 'Poly Market', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all font-bold ${
                activeTab === item.id ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              <span>{item.label}</span>
            </button>
          ))}
          </div>
        </div>

        <div className="px-6 pb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-4">Management</p>
          <div className="space-y-2">
            {[
              { id: 'creator', path: '/creator', label: 'Creator Hub', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', role: UserRole.CREATOR },
              { id: 'live', path: '/live', label: 'Go Live', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', role: UserRole.CREATOR },
              { id: 'admin', path: '/admin', label: 'Admin Panel', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', role: UserRole.ADMIN },
            ].filter(i => i.role === user.role || user.role === UserRole.ADMIN).map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all font-bold ${
                  activeTab === item.id ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto px-6 pt-4 pb-6 border-t border-gray-200">
          <div className="relative mb-6">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 hover:border-purple-300 transition relative"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 overflow-hidden relative">
                  <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold truncate text-gray-900">{user.name}</p>
                <p className="text-xs text-purple-600 font-bold">${user.balance.toLocaleString()}</p>
              </div>
            </button>
            {showNotifications && (
              <Notifications 
                notifications={notifications} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </div>
          <button className="w-full p-3 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl font-bold transition flex items-center justify-center space-x-2 border border-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-1 relative h-screen overflow-y-auto overflow-x-hidden scrollbar-hide transition-all duration-300 bg-white`}>
        <Routes>
          <Route path="/" element={<Home user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/home" element={<Home user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/watch/:id" element={<VideoPlayer onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/feed" element={<Feed user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/reel" element={<Feed user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/explore" element={<Feed user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/market" element={<PredictionMarket onBack={() => navigate('/')} />} />
          <Route path="/polymarket" element={<PredictionMarket onBack={() => navigate('/')} />} />
          <Route path="/creator" element={<CreatorDashboard user={user} />} />
          <Route path="/live" element={<LiveStream user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/create" element={<CameraView />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="*" element={<Home user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
        </Routes>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center py-1.5 px-3 z-[9999] shadow-lg">
        {/* Left side icons */}
        <div className="flex-1 flex justify-around items-center">
          {[
            { id: 'reel', path: '/reel', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'shop', path: '/shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`p-1.5 rounded-2xl transition ${activeTab === item.id ? 'text-purple-600 scale-110' : 'text-gray-500'}`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            </button>
          ))}
        </div>

        {/* Center + icon */}
        <div className="flex-shrink-0 mx-4 relative">
          <button
            onClick={() => navigate('/create')}
            className={`p-1.5 rounded-2xl transition ${activeTab === 'creator' ? 'text-purple-600 scale-110' : 'text-gray-500'}`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Right side icons */}
        <div className="flex-1 flex justify-around items-center">
          {[
            { id: 'polymarket', path: '/polymarket', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`p-1.5 rounded-2xl transition ${activeTab === item.id ? 'text-purple-600 scale-110' : 'text-gray-500'}`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
