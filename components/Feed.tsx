
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_VIDEOS, MOCK_USER } from '../constants';
import { HeartIcon, CommentIcon, ShareIcon, BetIcon } from './Icons';
import BettingOverlay from './BettingOverlay';
import { Video, User } from '../types';

interface FeedProps {
  user?: User;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const VideoCard: React.FC<{ video: Video; isActive: boolean; cardHeight: string }> = ({ video, isActive, cardHeight }) => {
  const [showBetting, setShowBetting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current && !isPaused) {
      videoRef.current.play().catch(e => console.log('Autoplay blocked'));
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive, isPaused]);

  // Reset pause state when video becomes inactive
  useEffect(() => {
    if (!isActive) {
      setIsPaused(false);
    }
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
      style={{ height: cardHeight, maxHeight: cardHeight, scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      onClick={togglePlayPause}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.url}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={video.thumbnail}
      />
      
      {/* Play/Pause feedback icon */}
      {showPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/40 p-6 rounded-full animate-ping opacity-0">
             {isPaused ? (
               <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
             ) : (
               <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
             )}
          </div>
          <div className="bg-black/20 p-6 rounded-full absolute transition-opacity duration-300">
             {isPaused ? (
               <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
             ) : (
               <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
             )}
          </div>
        </div>
      )}

      {/* Overlay controls */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

      {/* Right Side Interaction Bar */}
      <div className="absolute right-2 bottom-24 lg:bottom-16 flex flex-col items-center space-y-3 sm:space-y-3.5 lg:space-y-4 z-[10]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="relative">
            <img src={video.creatorAvatar} className="w-12 h-12 lg:w-10 lg:h-10 rounded-full border-2 border-white" alt={video.creatorName} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-500 rounded-full p-0.5">
              <svg className="w-3.5 h-3.5 lg:w-3 lg:h-3" fill="white" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center transition active:scale-125"
        >
          <div className={`p-2.5 lg:p-2 rounded-full ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-700 bg-gray-100'} hover:bg-gray-200 transition`}>
            <HeartIcon className="w-7 h-7 lg:w-6 lg:h-6" />
          </div>
          <span className="text-xs font-bold mt-1 text-gray-700">{(video.likes / 1000).toFixed(1)}K</span>
        </button>

        <button className="flex flex-col items-center text-gray-700">
          <div className="p-2.5 lg:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <CommentIcon className="w-7 h-7 lg:w-6 lg:h-6" />
          </div>
          <span className="text-xs font-bold mt-1">{video.comments}</span>
        </button>

        <button className="flex flex-col items-center text-gray-700">
          <div className="p-2.5 lg:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <ShareIcon className="w-7 h-7 lg:w-6 lg:h-6" />
          </div>
          <span className="text-xs font-bold mt-1">Share</span>
        </button>

        {video.betEvent && (
          <button 
            onClick={() => setShowBetting(true)}
            className="flex flex-col items-center text-purple-600 mt-3 lg:mt-2"
          >
            <div className="p-3 lg:p-2.5 rounded-full bg-purple-500 text-white shadow-xl shadow-purple-500/50 hover:bg-purple-600 transition">
              <svg className="w-6 h-6 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
            </div>
            <span className="text-[10px] font-black mt-1.5 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">BET LIVE</span>
          </button>
        )}
      </div>

      {/* Bottom Info Section */}
      <div className="absolute left-4 bottom-24 lg:bottom-16 right-20 pointer-events-none">
        <h4 className="text-white font-bold text-base sm:text-lg mb-1 drop-shadow-lg">@{video.creatorName}</h4>
        <p className="text-white text-sm sm:text-base line-clamp-2 mb-2 drop-shadow-lg">{video.title}</p>
        <p className="text-white/90 text-sm sm:text-base line-clamp-2 mb-2 drop-shadow-lg">{video.description}</p>
        <div className="flex items-center space-x-2 text-white/80 text-xs sm:text-sm drop-shadow-lg">
          <svg className="w-4 h-4 sm:w-4 sm:h-4 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <span className="truncate">Original audio - {video.creatorName}</span>
        </div>
      </div>

      {showBetting && video.betEvent && (
        <div onClick={(e) => e.stopPropagation()}>
          <BettingOverlay 
            event={video.betEvent}
            user={MOCK_USER}
            onClose={() => setShowBetting(false)}
            onPlaceBet={(opt, amt) => {
              alert(`Bet placed: ${amt} coins on ${opt}`);
              setShowBetting(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

const Feed: React.FC<FeedProps> = ({ user = MOCK_USER, onToggleSidebar, sidebarOpen = true }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const topNavbarHeight = 56; // Top navbar height
      const bottomNavbarHeight = 55; // Bottom navbar height
      const cardHeight = window.innerWidth < 1024 
        ? window.innerHeight - topNavbarHeight - bottomNavbarHeight 
        : window.innerHeight;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / cardHeight);
      setActiveIndex(index);
    }
  };

  const [containerHeight, setContainerHeight] = useState('100vh');
  const [cardHeight, setCardHeight] = useState('100vh');
  const [topOffset, setTopOffset] = useState('0px');

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 1024) {
        // Account for top navbar (approximately 56px) and bottom navbar (approximately 55px)
        const topNavbarHeight = 56;
        const bottomNavbarHeight = 55;
        const totalNavbarHeight = topNavbarHeight + bottomNavbarHeight;
        // Container should fill the space between navbars - positioned below top navbar
        // Height accounts for both navbars, so content won't hide behind them
        setContainerHeight(`calc(100vh - ${totalNavbarHeight}px)`);
        // Each card should fill the full container height exactly
        setCardHeight(`calc(100vh - ${totalNavbarHeight}px)`);
        setTopOffset(`${topNavbarHeight}px`);
      } else {
        // Desktop: Account for top bar (56px)
        const desktopTopBarHeight = 56;
        setContainerHeight(`calc(100vh - ${desktopTopBarHeight}px)`);
        setCardHeight(`calc(100vh - ${desktopTopBarHeight}px)`);
        setTopOffset(`${desktopTopBarHeight}px`);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Get first 6 videos
  const videosToShow = MOCK_VIDEOS.slice(0, 6);

  const [activeNavItem, setActiveNavItem] = useState('For You');

  return (
    <div className="w-full min-h-screen bg-black relative">
      {/* Desktop Top Bar - YouTube Style */}
      <div className="hidden lg:flex sticky top-0 z-[9998] bg-white border-b border-gray-200 h-14 items-center px-4 w-full">
        {/* Left Section */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Guide/Hamburger Menu Button - Only show when sidebar is closed */}
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Guide"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
          {/* Voice Search Button */}
          <button
            className="p-2.5 rounded-full hover:bg-gray-100 transition"
            aria-label="Search with your voice"
            title="Search with your voice"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Create Button */}
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

          {/* Notifications Button */}
          <button
            className="p-2.5 rounded-full hover:bg-gray-100 transition relative"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={() => navigate('/profile')}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-gray-200 transition"
            aria-label="Account menu"
          >
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-9 h-9 rounded-full"
            />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[9998] bg-white border-b border-gray-200 lg:hidden">
        <div className="relative flex items-center">
          {/* Live Icon - Index 0 (Fixed) */}
          <button
            onClick={() => setActiveNavItem('Live')}
            className={`flex-shrink-0 px-4 py-3 flex items-center space-x-2 transition ${
              activeNavItem === 'Live' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-bold text-sm whitespace-nowrap">Live</span>
          </button>

          {/* Scrollable Nav Items Container */}
          <div className="flex items-center overflow-x-auto scrollbar-hide flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Stem - Index 1 */}
            <button
              onClick={() => setActiveNavItem('Stem')}
              className={`flex-shrink-0 px-4 py-3 font-bold text-sm whitespace-nowrap transition ${
                activeNavItem === 'Stem' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
              }`}
            >
              Stem
            </button>

            {/* Explore - Index 2 */}
            <button
              onClick={() => setActiveNavItem('Explore')}
              className={`flex-shrink-0 px-4 py-3 font-bold text-sm whitespace-nowrap transition ${
                activeNavItem === 'Explore' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
              }`}
            >
              Explore
            </button>

            {/* Following - Index 3 */}
            <button
              onClick={() => setActiveNavItem('Following')}
              className={`flex-shrink-0 px-4 py-3 font-bold text-sm whitespace-nowrap transition ${
                activeNavItem === 'Following' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
              }`}
            >
              Following
            </button>

            {/* Friend - Index 4 */}
            <button
              onClick={() => setActiveNavItem('Friend')}
              className={`flex-shrink-0 px-4 py-3 font-bold text-sm whitespace-nowrap transition ${
                activeNavItem === 'Friend' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
              }`}
            >
              Friend
            </button>

            {/* For You - Index 5 */}
            <button
              onClick={() => setActiveNavItem('For You')}
              className={`flex-shrink-0 px-4 py-3 font-bold text-sm whitespace-nowrap transition ${
                activeNavItem === 'For You' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
              }`}
            >
              For You
            </button>
          </div>

          {/* Search Icon - Extreme Right (Fixed/Sticky) */}
          <div className="flex-shrink-0 px-4 py-3 border-l border-gray-200 bg-white z-10">
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              aria-label="Search"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Vertical Scroll with Snap */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
        style={{ 
          height: containerHeight,
          maxHeight: containerHeight,
          marginTop: topOffset,
          scrollBehavior: 'smooth',
          scrollSnapType: 'y mandatory',
          scrollSnapStop: 'always',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollPaddingTop: '0px',
          willChange: 'scroll-position'
        }}
      >
        {videosToShow.map((video, i) => (
          <VideoCard key={video.id} video={video} isActive={activeIndex === i} cardHeight={cardHeight} />
        ))}
        <div className="w-full flex items-center justify-center bg-gray-50 snap-start" style={{ height: cardHeight, minHeight: cardHeight }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading more epic moments...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
