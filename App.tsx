
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Feed from './components/Feed';
import CreatorDashboard from './components/CreatorDashboard';
import AdminPanel from './components/AdminPanel';
import LiveStream from './components/LiveStream';
import PredictionMarket from './components/PredictionMarket';
import Notifications from './components/Notifications';
import { MOCK_USER } from './constants';
import { UserRole, Notification } from './types';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(MOCK_USER);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState<Notification[]>([
    { id: '1', message: 'You won 450 coins on "Triple Backflip Attempt"!', type: 'bet_win', timestamp: Date.now() - 3600000 },
    { id: '2', message: 'New video from ExtremeSports: "Death Dive"', type: 'new_video', timestamp: Date.now() - 7200000 },
    { id: '3', message: 'Bet lost: "ChefMaster Challenge"', type: 'bet_loss', timestamp: Date.now() - 86400000 },
  ]);

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/market') return 'market';
    if (path === '/explore') return 'explore';
    if (path === '/creator') return 'creator';
    if (path === '/admin') return 'admin';
    if (path === '/live') return 'live';
    return 'feed'; // default to feed
  };

  const activeTab = getActiveTab();

  // Redirect root to /feed
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/feed', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row relative">
      {/* Sidebar - Desktop */}
      <nav className={`hidden lg:flex flex-col w-72 h-screen border-r border-zinc-800 p-6 ${sidebarOpen ? 'sticky' : 'fixed'} top-0 overflow-y-auto scrollbar-hide transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40">
              <span className="text-2xl font-black italic">V</span>
            </div>
            <span className="text-2xl font-black tracking-tighter">VPULSE</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition text-zinc-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Functionality */}
        <div className="mb-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-2xl bg-zinc-900 leading-5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition"
          />
        </div>

        <div className="space-y-2 mb-10">
          {[
            { id: 'feed', path: '/feed', label: 'For You', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'explore', path: '/explore', label: 'Explore', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { id: 'market', path: '/market', label: 'Markets', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all font-bold ${
                activeTab === item.id ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-10">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-3 mb-4">Management</p>
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
                  activeTab === item.id ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-zinc-800">
          <div className="relative mb-6">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center space-x-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800 hover:border-purple-500/50 transition relative"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500 overflow-hidden relative">
                  <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-zinc-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-purple-400 font-bold">${user.balance.toLocaleString()}</p>
              </div>
            </button>
            {showNotifications && (
              <Notifications 
                notifications={notifications} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </div>
          <button className="w-full p-3 bg-zinc-900 hover:bg-red-600/20 text-zinc-400 hover:text-red-500 rounded-xl font-bold transition flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-1 relative h-screen overflow-y-auto overflow-x-hidden scrollbar-hide transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Hamburger button when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:flex fixed top-4 left-4 z-50 p-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition text-zinc-400 hover:text-white shadow-lg backdrop-blur-sm"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Routes>
          <Route path="/feed" element={<Feed />} />
          <Route path="/explore" element={<Feed />} />
          <Route path="/market" element={<PredictionMarket onBack={() => navigate('/feed')} />} />
          <Route path="/creator" element={<CreatorDashboard user={user} />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/live" element={<LiveStream user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="*" element={<Feed />} />
        </Routes>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-zinc-800 flex justify-around items-center p-3 z-[100]">
        {[
          { id: 'feed', path: '/feed', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'explore', path: '/explore', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
          { id: 'live', path: '/live', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
          { id: 'market', path: '/market', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { id: 'creator', path: '/creator', icon: 'M12 4v16m8-8H4' },
          { id: 'admin', path: '/admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`p-3 rounded-2xl transition ${activeTab === item.id ? 'text-purple-500 scale-110' : 'text-zinc-500'}`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
          </button>
        ))}
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
