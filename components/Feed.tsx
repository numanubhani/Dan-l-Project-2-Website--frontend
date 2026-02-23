
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_VIDEOS, MOCK_USER } from '../constants';
import { HeartIcon, CommentIcon, ShareIcon, BetIcon } from './Icons';
import BettingOverlay from './BettingOverlay';
import { Video } from '../types';

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
      className="relative w-full snap-start snap-always overflow-hidden bg-white flex items-center justify-center cursor-pointer"
      style={{ height: cardHeight, scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
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
      <div className="absolute right-2 bottom-40 lg:bottom-24 flex flex-col items-center space-y-2 sm:space-y-2.5 lg:space-y-3 z-[10]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="relative mb-1.5">
            <img src={video.creatorAvatar} className="w-10 h-10 lg:w-8 lg:h-8 rounded-full border-2 border-white" alt={video.creatorName} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-500 rounded-full p-0.5">
              <svg className="w-3 h-3 lg:w-2.5 lg:h-2.5" fill="white" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center transition active:scale-125"
        >
          <div className={`p-2 lg:p-1.5 rounded-full ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-700 bg-gray-100'} hover:bg-gray-200 transition`}>
            <HeartIcon className="w-6 h-6 lg:w-5 lg:h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-gray-700">{(video.likes / 1000).toFixed(1)}K</span>
        </button>

        <button className="flex flex-col items-center text-gray-700">
          <div className="p-2 lg:p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <CommentIcon className="w-6 h-6 lg:w-5 lg:h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">{video.comments}</span>
        </button>

        <button className="flex flex-col items-center text-gray-700">
          <div className="p-2 lg:p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <ShareIcon className="w-6 h-6 lg:w-5 lg:h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Share</span>
        </button>

        {video.betEvent && (
          <button 
            onClick={() => setShowBetting(true)}
            className="flex flex-col items-center text-purple-600 mt-3 lg:mt-2"
          >
            <div className="p-3 lg:p-2 rounded-full bg-purple-500 text-white shadow-xl shadow-purple-500/50 hover:bg-purple-600 transition">
              <BetIcon className="w-8 h-8 lg:w-6 lg:h-6" />
            </div>
            <span className="text-[10px] font-black mt-1.5 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-lg">BET LIVE</span>
          </button>
        )}
      </div>

      {/* Bottom Info Section */}
      <div className="absolute left-4 bottom-36 lg:bottom-20 right-20 pointer-events-none">
        <h4 className="text-white font-bold text-sm sm:text-base mb-0.5 drop-shadow-lg">@{video.creatorName}</h4>
        <p className="text-white text-xs sm:text-sm line-clamp-2 mb-1.5 drop-shadow-lg">{video.title}</p>
        <p className="text-white/90 text-xs sm:text-sm line-clamp-2 mb-1.5 drop-shadow-lg">{video.description}</p>
        <div className="flex items-center space-x-2 text-white/80 text-[10px] sm:text-xs drop-shadow-lg">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
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

const Feed: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const cardHeight = window.innerWidth < 1024 ? window.innerHeight - 55 : window.innerHeight;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / cardHeight);
      setActiveIndex(index);
    }
  };

  const [containerHeight, setContainerHeight] = useState('100vh');
  const [cardHeight, setCardHeight] = useState('100vh');

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 1024) {
        // Account for bottom navbar (approximately 55px)
        setContainerHeight('calc(100vh - 55px)');
        setCardHeight('calc(100vh - 55px)');
      } else {
        setContainerHeight('100vh');
        setCardHeight('100vh');
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
    <div className="w-full min-h-screen bg-white relative">
      {/* Sticky Top Navbar */}
      <div className="sticky top-0 z-[9998] bg-white border-b border-gray-200 lg:hidden">
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
        className="w-full overflow-y-scroll snap-y snap-mandatory bg-white scrollbar-hide lg:h-screen pb-20 lg:pb-0"
        style={{ 
          height: containerHeight,
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
        <div className="w-full flex items-center justify-center bg-gray-50 snap-start pb-20 lg:pb-0" style={{ height: cardHeight }}>
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
