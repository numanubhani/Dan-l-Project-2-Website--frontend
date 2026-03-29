
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Feed from './components/Feed';
import ExplorePage from './components/Explore';
import FollowingPage from './components/Following';
import Home from './components/Home';
import HomeLongVideos from './components/HomeLongVideos';
import VideoPlayer from './components/VideoPlayer';
import CreatorDashboard from './components/CreatorDashboard';
import AdminPanel from './components/AdminPanel';
import LiveStream from './components/LiveStream';
import PredictionMarket from './components/PredictionMarket';
import Notifications from './components/Notifications';
import CameraView from './components/CameraView';
import Shop from './components/Shop';
import Profile from './components/Profile';
import Login from './components/Login';
import VideoUpload from './components/VideoUpload';
import { api, User as ApiUser, getAuthToken, convertApiUserToUser } from './services/api';
import { UserRole, Notification, User } from './types';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const apiUser = await api.getCurrentUser();
          setUser(convertApiUserToUser(apiUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // Load notifications from backend when user is logged in
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }
    const loadNotifications = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data.map((n) => ({
          id: String(n.id),
          message: n.message,
          type: n.type as 'bet_win' | 'bet_loss' | 'new_video',
          timestamp: n.timestamp,
        })));
      } catch {
        setNotifications([]);
      }
    };
    loadNotifications();
  }, [isAuthenticated, user]);

  const handleLoginSuccess = async () => {
    try {
      const apiUser = await api.getCurrentUser();
      setUser(convertApiUserToUser(apiUser));
      setIsAuthenticated(true);
      // Toast is already shown in Login/LoginModal components
    } catch (error) {
      console.error('Failed to load user after login:', error);
      showError('Failed to load user data');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      showSuccess('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Error during logout');
    }
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Check if device is mobile
  const isMobile = () => {
    return window.innerWidth < 1024; // lg breakpoint in Tailwind
  };

  // On mobile, /home (long-video grid) is desktop-only — send to /reel feed instead
  useEffect(() => {
    if (isMobile() && location.pathname === '/home') {
      navigate('/reel', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Hide sidebar when on login page
  useEffect(() => {
    if (location.pathname === '/login') {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/home') return 'home';
    if (path === '/' || path === '/reel' || path === '/feed') return 'foryou';
    if (path === '/shop') return 'shop';
    if (path === '/market' || path === '/polymarket') return 'polymarket';
    if (path === '/explore') return 'explore';
    if (path === '/following') return 'following';
    if (path === '/creator') return 'creator';
    if (path === '/live') return 'live';
    if (path === '/create') return 'creator';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Show login if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-neon-violet to-neon-pink rounded-xl flex items-center justify-center shadow-lg shadow-neon-violet/45 mx-auto mb-4">
            <span className="text-3xl font-black italic text-white">V</span>
          </div>
          <p className="text-gray-600 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const isLoginPage = location.pathname === '/login';
  const showSidebar = !isLoginPage && sidebarOpen;

  // Allow users to browse without login - authentication is only required for specific actions
  return (
    <AuthProvider
      initialUser={user || null}
      initialIsAuthenticated={isAuthenticated}
      onLoginSuccess={handleLoginSuccess}
    >
      {/*
        Root: fixed viewport height, no overflow — each zone scrolls independently.
        Sidebar is fixed (out of flow); main gets padding-left to match.
      */}
      <div className="h-screen overflow-hidden bg-neon-base">

      {/* ── Desktop Sidebar ── fixed, never in flex flow */}
      <nav
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-[9999] w-52 bg-neon-base/98 backdrop-blur-md border-r border-white/[0.06] shadow-[inset_-1px_0_0_rgba(168,85,247,0.12)] transition-transform duration-300 ease-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-hidden={!showSidebar}
      >
        {/* ── Logo — 56px tall, matches page top-navbar height exactly ── */}
        <div className="h-14 flex items-center px-3 shrink-0 border-b border-white/[0.06]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-white/5 transition w-full"
          >
            <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-neon-violet to-neon-cyan rounded-lg flex items-center justify-center shadow-md shadow-neon-violet/35">
              <span className="text-base font-black italic text-white leading-none">V</span>
            </div>
            <span className="text-[17px] font-black tracking-tight text-white">VPULSE</span>
          </button>
        </div>

        {/* ── Nav items — flex-1 fills space between logo and bottom; scrolls invisibly if needed ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-2 py-2 space-y-0.5 min-h-0">
          {/* Main nav items */}
          {[
            {
              id: 'home', path: '/home', label: 'Home',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
            },
            {
              id: 'foryou', path: '/reel', label: 'For You',
              icon: <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M16.57 7.49a1 1 0 0 0-.13 1.4l3.62 4.31H15.7c-2.8 0-4.2 0-5.27.55a5 5 0 0 0-2.18 2.18C7.7 17 7.7 18.4 7.7 21.2v10.7c0 2.8 0 4.2.55 5.27a5 5 0 0 0 2.18 2.19c1.07.54 2.47.54 5.27.54h16.6c2.8 0 4.2 0 5.27-.54a5 5 0 0 0 2.19-2.19c.54-1.07.54-2.47.54-5.27V21.2c0-2.8 0-4.2-.54-5.27a5 5 0 0 0-2.19-2.18c-1.07-.55-2.47-.55-5.27-.55h-4.42l3.61-4.3a1 1 0 0 0-.12-1.41l-.77-.65a1 1 0 0 0-1.4.13l-5.23 6.22-5.23-6.22a1 1 0 0 0-1.4-.13l-.77.65Z"/></svg>,
            },
            {
              id: 'explore', path: '/explore', label: 'Explore',
              icon: <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M24 37.4a13.4 13.4 0 1 0 0-26.8 13.4 13.4 0 0 0 0 26.8ZM40.5 24a16.5 16.5 0 1 1-33 0 16.5 16.5 0 0 1 33 0Z"/><path d="M27.13 27.18 19 32.1a.6.6 0 0 1-.9-.63l1.84-9.33a2 2 0 0 1 .92-1.32L29 15.9a.6.6 0 0 1 .9.63l-1.84 9.33a2 2 0 0 1-.93 1.32Zm-5.04-.45 3.11-1.89.7-3.57-3.1 1.89-.7 3.57Z"/></svg>,
            },
            {
              id: 'following', path: '/following', label: 'Following',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
            },
            {
              id: 'live', path: '/live', label: 'LIVE',
              icon: <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M16.78 26.82c-.08.18-.08.41-.08.88v3.9c0 .47 0 .7.08.88.1.25.3.44.54.54.18.08.41.08.88.08.47 0 .7 0 .88-.08a1 1 0 0 0 .54-.54c.08-.18.08-.41.08-.88v-3.9c0-.47 0-.7-.08-.88a1 1 0 0 0-.54-.54c-.18-.08-.41-.08-.88-.08-.47 0-.7 0-.88.08a1 1 0 0 0-.54.54ZM22.5 21.4c0-.47 0-.7.08-.88a1 1 0 0 1 .54-.54c.18-.08.41-.08.88-.08.47 0 .7 0 .88.08.25.1.44.3.54.54.08.18.08.41.08.88v10.2c0 .47 0 .7-.08.88a1 1 0 0 1-.54.54c-.18.08-.41.08-.88.08-.47 0-.7 0-.88-.08a1 1 0 0 1-.54-.54c-.08-.18-.08-.41-.08-.88V21.4ZM28.38 24.32c-.08.18-.08.41-.08.88v6.4c0 .47 0 .7.08.88.1.25.3.44.54.54.18.08.41.08.88.08.47 0 .7 0 .88-.08a1 1 0 0 0 .54-.54c.08-.18.08-.41.08-.88v-6.4c0-.47 0-.7-.08-.88a1 1 0 0 0-.54-.54c-.18-.08-.41-.08-.88-.08-.47 0-.7 0-.88.08a1 1 0 0 0-.54.54Z"/><path d="M16.57 7.49a1 1 0 0 0-.13 1.4l3.62 4.31H15.7c-2.8 0-4.2 0-5.27.55a5 5 0 0 0-2.18 2.18C7.7 17 7.7 18.4 7.7 21.2v10.7c0 2.8 0 4.2.55 5.27a5 5 0 0 0 2.18 2.19c1.07.54 2.47.54 5.27.54h16.6c2.8 0 4.2 0 5.27-.54a5 5 0 0 0 2.19-2.19c.54-1.07.54-2.47.54-5.27V21.2c0-2.8 0-4.2-.54-5.27a5 5 0 0 0-2.19-2.18c-1.07-.55-2.47-.55-5.27-.55h-4.42l3.61-4.3a1 1 0 0 0-.12-1.41l-.77-.65a1 1 0 0 0-1.4.13l-5.23 6.22-5.23-6.22a1 1 0 0 0-1.4-.13l-.77.65Z"/></svg>,
            },
            {
              id: 'shop', path: '/shop', label: 'Shop',
              icon: <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M14 10a2 2 0 0 0-2 2v2H8a2 2 0 0 0-2 2l2 22a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2l2-22a2 2 0 0 0-2-2h-4v-2a2 2 0 0 0-2-2H14Zm0 4h20v2H14v-2Zm-4 6h28l-2 18H12L10 20Zm14 2a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6 6 6 0 0 0-6-6Z"/></svg>,
            },
            {
              id: 'polymarket', path: '/polymarket', label: 'Poly Market',
              icon: <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0"><rect x="6" y="36" width="36" height="4" rx="2"/><rect x="6" y="22" width="6" height="14" rx="1"/><rect x="16" y="14" width="6" height="22" rx="1"/><rect x="26" y="26" width="6" height="10" rx="1"/><rect x="36" y="18" width="6" height="18" rx="1"/></svg>,
            },
            {
              id: 'creator', path: '/create', label: 'Upload',
              icon: <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M25 15a1 1 0 0 1 1 1v6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-6v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6h-6a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h6v-6a1 1 0 0 1 1-1h2Z"/><path d="M33.58 4.5H14.42c-1.33 0-2.45 0-3.37.07-.95.08-1.86.25-2.73.7a7 7 0 0 0-3.06 3.05 7.14 7.14 0 0 0-.69 2.73 44.6 44.6 0 0 0-.07 3.37v19.16c0 1.33 0 2.45.07 3.37.08.95.25 1.86.7 2.73a7 7 0 0 0 3.05 3.06c.87.44 1.78.6 2.73.69.92.07 2.04.07 3.37.07h19.16c1.33 0 2.45 0 3.37-.07a7.14 7.14 0 0 0 2.73-.7 7 7 0 0 0 3.06-3.05c.44-.87.6-1.78.69-2.73.07-.92.07-2.04.07-3.37V14.42c0-1.33 0-2.45-.07-3.37a7.14 7.14 0 0 0-.7-2.73 7 7 0 0 0-3.05-3.06 7.14 7.14 0 0 0-2.73-.69 44.6 44.6 0 0 0-3.37-.07Z"/></svg>,
            },
            {
              id: 'profile', path: '/profile', label: 'Profile',
              icon: <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M24 3a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 19c10.3 0 16.67 6.99 17 17 .02.55-.43 1-1 1h-2c-.54 0-.98-.45-1-1-.3-7.84-4.9-13-13-13s-12.7 5.16-13 13c-.02.55-.46 1-1.02 1h-2c-.55 0-1-.45-.98-1 .33-10.01 6.7-17 17-17Z"/></svg>,
            },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-200 text-[13px] ${
                activeTab === item.id
                  ? 'text-neon-pink font-black bg-white/[0.04] shadow-[inset_3px_0_0_0_rgba(236,72,153,0.75)]'
                  : 'text-white font-semibold hover:bg-white/[0.06]'
              }`}
            >
              <span className={activeTab === item.id ? 'text-neon-pink' : 'text-white'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}

          {/* Role-gated items */}
          {user && (user.role === UserRole.CREATOR || user.role === UserRole.ADMIN) && (
            <button
              onClick={() => navigate('/creator')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all text-[13px] text-white font-semibold hover:bg-white/[0.06]"
            >
              <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M8 12h4v24H8V12Zm6 12h4v12h-4V24Zm6-8h4v20h-4V16Zm6 4h4v16h-4V20Zm6-8h4v24h-4V12Z"/>
              </svg>
              <span>Creator Hub</span>
            </button>
          )}

          {user && user.role === UserRole.ADMIN && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all text-[13px] text-white font-semibold hover:bg-white/[0.06]"
            >
              <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M24 4 6 11v11c0 11 7.6 21.3 18 24 10.4-2.7 18-13 18-24V11L24 4Zm-2 28-6-6 2.8-2.8 3.2 3.2 8.2-8.2L33 21l-11 11Z"/>
              </svg>
              <span>Admin Panel</span>
            </button>
          )}

          {/* Notifications for logged-in user */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all text-[13px] text-white font-semibold hover:bg-white/[0.06]"
              >
                <span className="relative shrink-0">
                  <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5">
                    <path d="M24 4a8 8 0 0 0-8 8v2.2A12 12 0 0 0 12 24v8l-4 4v2h32v-2l-4-4v-8a12 12 0 0 0-4-9.8V12a8 8 0 0 0-8-8Zm0 40a4 4 0 0 0 4-4h-8a4 4 0 0 0 4 4Z"/>
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-neon-pink rounded-full border border-neon-base" />
                  )}
                </span>
                <span>Notifications</span>
              </button>
              {showNotifications && (
                <Notifications
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
          )}

          {/* More */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(v => !v)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all text-[13px] font-semibold hover:bg-white/[0.06] ${showMoreMenu ? 'text-neon-pink' : 'text-white'}`}
            >
              <svg viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M5 24a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm15 0a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm15 0a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/>
              </svg>
              <span>More</span>
            </button>

            {/* TikTok-style More panel — flies out to the right of the sidebar */}
            {showMoreMenu && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-[60]" onClick={() => setShowMoreMenu(false)} />

                {/* Panel */}
                <div className="fixed left-52 bottom-16 z-[61] w-72 bg-neon-panel rounded-2xl shadow-2xl shadow-neon-violet/15 overflow-hidden border border-white/[0.08]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-gradient-to-br from-neon-violet to-neon-cyan rounded-lg flex items-center justify-center shadow-md shadow-neon-cyan/25">
                        <span className="text-sm font-black italic text-white leading-none">V</span>
                      </div>
                      <span className="text-[17px] font-bold text-white">More</span>
                    </div>
                    <button
                      onClick={() => setShowMoreMenu(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  {/* Settings section */}
                  <div className="px-2 pt-3 pb-1">
                    <p className="px-3 pb-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Settings</p>

                    {/* Language */}
                    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition group">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                        </svg>
                        <span className="text-[14px] font-semibold text-white">English (US)</span>
                      </div>
                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>

                    {/* Dark mode toggle */}
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                        </svg>
                        <span className="text-[14px] font-semibold text-white">Dark mode</span>
                      </div>
                      {/* Three-way toggle: Auto / Dark / Light */}
                      <div className="flex items-center bg-white/10 rounded-full p-0.5 gap-0.5">
                        {[
                          { label: 'Auto', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg> },
                          { label: 'Dark', icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg> },
                          { label: 'Light', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg> },
                        ].map(opt => (
                          <button
                            key={opt.label}
                            onClick={() => setDarkMode(opt.label === 'Dark')}
                            className={`p-1.5 rounded-full transition ${darkMode && opt.label === 'Dark' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                            title={opt.label}
                          >
                            {opt.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mx-4 my-1 border-t border-white/[0.06]" />

                  {/* Tools section */}
                  <div className="px-2 pt-2 pb-1">
                    <p className="px-3 pb-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Tools</p>

                    <button
                      onClick={() => { navigate('/creator'); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition"
                    >
                      <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-semibold text-white">Creator Studio</span>
                        <span className="w-2 h-2 bg-neon-pink rounded-full" />
                      </div>
                    </button>

                    <button
                      onClick={() => { navigate('/upload'); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition"
                    >
                      <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                      <span className="text-[14px] font-semibold text-white">Upload Video</span>
                    </button>
                  </div>

                  <div className="mx-4 my-1 border-t border-white/[0.06]" />

                  {/* Other section */}
                  <div className="px-2 pt-2 pb-3">
                    <p className="px-3 pb-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Other</p>

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition">
                      <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      <span className="text-[14px] font-semibold text-white">Support</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Bottom section — never shrinks; always visible at bottom of sidebar ── */}
        <div className="shrink-0 border-t border-white/[0.08] min-h-0">
          {user ? (
            /* Logged-in: compact user row + logout */
            <div className="px-2 py-2 space-y-0.5">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.06] transition text-left"
              >
                <div className="relative shrink-0">
                  <img src={user.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" alt="" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-neon-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/40 truncate">${user.balance.toLocaleString()}</p>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[15px] text-white font-semibold hover:bg-white/[0.06] hover:text-neon-pink transition"
              >
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m14 4v1a5 5 0 01-5 5H8a5 5 0 01-5-5V9a5 5 0 015-5h8a5 5 0 015 5v1"/>
                </svg>
                <span>Log out</span>
              </button>
            </div>
          ) : (
            /* Logged-out: solid Log in button (no helper text, matching TikTok exactly) */
            <div className="px-3 py-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 rounded-full bg-neon-pink hover:bg-neon-pink-hover text-white font-bold text-[15px] transition duration-200 shadow-neon-pink/30 hover:shadow-neon-pink/50"
              >
                Log in
              </button>
            </div>
          )}

          {/* Footer — vertically stacked, compact */}
          <div className="px-4 pt-1 pb-3 space-y-0.5">
            {['Company', 'Programs', 'Terms & Policies'].map(link => (
              <p key={link} className="text-[11px] text-white/25 hover:text-white/50 cursor-pointer transition">{link}</p>
            ))}
            <p className="text-[10px] text-white/15 pt-0.5">© 2026 VPulse</p>
          </div>
        </div>
      </nav>

      {/* ── Main content ── h-full fills the viewport-height root; pl shifts right of sidebar */}
      <main
        className={`relative z-0 h-full min-w-0 overflow-y-auto overflow-x-hidden scrollbar-hide transition-[padding-left] duration-300 ease-out ${
          showSidebar ? 'lg:pl-52' : ''
        }`}
      >
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/" element={<Home user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/home" element={<HomeLongVideos user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/watch/:id" element={<VideoPlayer />} />
          <Route path="/feed" element={<Feed user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/reel" element={<Feed user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/explore" element={<ExplorePage user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/following" element={<FollowingPage user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/market" element={<PredictionMarket onBack={() => navigate('/')} user={user} />} />
          <Route path="/polymarket" element={<PredictionMarket onBack={() => navigate('/')} user={user} />} />
          <Route path="/creator" element={<CreatorDashboard user={user} />} />
          <Route path="/live" element={<LiveStream user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="/create" element={<CameraView />} />
          <Route path="/upload" element={<VideoUpload user={user} />} />
          <Route path="/profile" element={<Profile user={user} onUserUpdate={setUser} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
          <Route path="*" element={<Home user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />} />
        </Routes>
      </main>

      {/* ── Mobile bottom navigation ── fixed to viewport, always on top */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-neon-base/92 backdrop-blur-xl border-t border-white/[0.08] shadow-neon-line flex items-center py-2 px-3 z-[9999]">
        {/* Left side icons */}
        <div className="flex-1 flex justify-around items-center">
          {[
            { id: 'reel', path: '/reel', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'shop', path: '/shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`p-1.5 rounded-xl transition ${activeTab === item.id ? 'text-neon-pink scale-110' : 'text-white/60 hover:text-white'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            </button>
          ))}
        </div>

        {/* Center + icon */}
        <div className="flex-shrink-0 mx-4">
          <button
            onClick={() => navigate('/create')}
            className="p-1.5 rounded-xl transition text-white/60 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
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
              className={`p-1.5 rounded-xl transition ${activeTab === item.id ? 'text-neon-pink scale-110' : 'text-white/60 hover:text-white'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            </button>
          ))}
        </div>
      </nav>
      </div>{/* end root h-screen */}
    </AuthProvider>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
