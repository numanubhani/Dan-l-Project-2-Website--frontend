
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_VIDEOS, MOCK_USER } from '../constants';
import { HeartIcon, CommentIcon, ShareIcon, BetIcon } from './Icons';
import BettingOverlay from './BettingOverlay';
import { Video } from '../types';

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
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="relative mb-2">
            <img src={video.creatorAvatar} className="w-12 h-12 rounded-full border-2 border-white" alt={video.creatorName} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-500 rounded-full p-0.5">
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center transition active:scale-125"
        >
          <div className={`p-3 rounded-full ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-white bg-white/10'} hover:bg-white/20 transition`}>
            <HeartIcon className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold mt-1 text-white shadow-sm">{(video.likes / 1000).toFixed(1)}K</span>
        </button>

        <button className="flex flex-col items-center text-white">
          <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
            <CommentIcon className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold mt-1">{video.comments}</span>
        </button>

        <button className="flex flex-col items-center text-white">
          <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
            <ShareIcon className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold mt-1">Share</span>
        </button>

        {video.betEvent && (
          <button 
            onClick={() => setShowBetting(true)}
          >
            <div className="p-4 rounded-full bg-purple-500 text-white shadow-xl shadow-purple-500/50 hover:bg-purple-400 transition">
              <BetIcon className="w-10 h-10" />
            </div>
            <span className="text-xs font-black mt-2 bg-black/60 px-2 py-1 rounded-lg">BET LIVE</span>
          </button>
        )}
      </div>

      {/* Bottom Info Section */}
        <h4 className="text-white font-bold text-lg mb-1">@{video.creatorName}</h4>
        <p className="text-zinc-200 text-sm line-clamp-2 mb-2">{video.title}</p>
        <div className="flex items-center space-x-2 text-zinc-300 text-xs">
          <svg className="w-4 h-4 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
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
      setActiveIndex(index);
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
    >
      {MOCK_VIDEOS.map((v, i) => (
      ))}
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Loading more epic moments...</p>
        </div>
      </div>
    </div>
  );
};

export default Feed;
