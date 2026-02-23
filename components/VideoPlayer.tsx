import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_VIDEOS } from '../constants';
import { Video } from '../types';

interface VideoPlayerProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ onToggleSidebar, sidebarOpen = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const foundVideo = MOCK_VIDEOS.find(v => v.id === id);
    if (foundVideo) {
      setVideo(foundVideo);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video) return;

    // Initialize video settings
    videoElement.volume = volume / 100;
    videoElement.playbackRate = playbackRate;
    setLikeCount(video.likes || 0);

    const updateTime = () => setCurrentTime(videoElement.currentTime);
    const updateDuration = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setIsLoading(false);
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('loadeddata', updateDuration);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);

    // Try to play video (may be blocked by browser)
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('loadeddata', updateDuration);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
    };
  }, [video, volume, playbackRate]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && isPlaying) {
      resetControlsTimeout();
    }
  }, [isPlaying, currentTime]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-playback-menu]') && !target.closest('[data-playback-button]')) {
        setShowPlaybackMenu(false);
      }
    };

    if (showPlaybackMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPlaybackMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullScreen();
      } else if (key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (videoRef.current) {
          const newVolume = Math.min(100, volume + 10);
          setVolume(newVolume);
          videoRef.current.volume = newVolume / 100;
          setIsMuted(false);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (videoRef.current) {
          const newVolume = Math.max(0, volume - 10);
          setVolume(newVolume);
          videoRef.current.volume = newVolume / 100;
          setIsMuted(newVolume === 0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [volume]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      resetControlsTimeout();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && duration > 0) {
      const seekTime = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      resetControlsTimeout();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted || volume === 0) {
        videoRef.current.volume = volume > 0 ? volume / 100 : 0.5;
        setIsMuted(false);
        setVolume(videoRef.current.volume * 100);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handlePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackMenu(false);
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href,
      }).catch(err => console.log('Error sharing', err));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current?.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current?.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  if (!video) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading video...</p>
        </div>
      </div>
    );
  }

  const relatedVideos = MOCK_VIDEOS.filter(v => v.id !== id).slice(0, 10);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar - Desktop */}
      <div className="hidden lg:flex sticky top-0 z-50 bg-white border-b border-gray-200 h-14 items-center px-6 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl font-black italic text-white">V</span>
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">VPULSE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Primary Video Section */}
        <div 
          id="primary" 
          className="flex-1 flex flex-col bg-black min-w-0 overflow-hidden"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (isPlaying) {
              setShowControls(false);
            }
          }}
        >
          {/* Video Player */}
          <div 
            className="relative w-full bg-black"
            style={{ 
              height: isFullscreen ? '100vh' : 'calc(100vh - 56px)',
              minHeight: isFullscreen ? '100vh' : 'calc(100vh - 56px)',
              maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 56px)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                  <p className="text-white/80 text-sm font-medium">Loading video...</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              src={video.url}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full"
              style={{
                objectFit: 'contain',
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              onClick={togglePlayPause}
              onError={() => setIsLoading(false)}
            />

            {/* Video Controls Overlay */}
            <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {/* Top Gradient & Back Button (Mobile) */}
              <div className="bg-gradient-to-b from-black/60 to-transparent p-4">
                <button
                  onClick={() => navigate('/')}
                  className="lg:hidden p-2.5 bg-black/50 rounded-full backdrop-blur-md text-white hover:bg-black/70 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Center Play/Pause Button */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={togglePlayPause} 
                  className="p-5 bg-black/70 rounded-full backdrop-blur-md text-white hover:bg-black/90 transition-all pointer-events-auto transform hover:scale-110 active:scale-95 shadow-2xl"
                >
                  {isPlaying ? (
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 lg:p-5">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration > 0 ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/25 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.25) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.25) 100%)`
                    }}
                  />
                </div>

                {/* Control Buttons Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    <button 
                      onClick={togglePlayPause} 
                      className="p-2.5 text-white hover:text-purple-400 transition-colors rounded-full hover:bg-white/10"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>

                    {/* Volume Control */}
                    <div className="relative flex items-center group">
                      <button
                        onClick={toggleMute}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                        className="p-2.5 text-white hover:text-purple-400 transition-colors rounded-full hover:bg-white/10"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : volume < 50 ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>
                      {showVolumeSlider && (
                        <div
                          className="absolute bottom-full left-0 mb-3 p-3 bg-black/95 rounded-xl backdrop-blur-md shadow-xl border border-white/10"
                          onMouseEnter={() => setShowVolumeSlider(true)}
                          onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1.5 bg-white/25 rounded-full appearance-none cursor-pointer accent-purple-500"
                            style={{
                              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume}%, rgba(255,255,255,0.25) ${volume}%, rgba(255,255,255,0.25) 100%)`
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-white text-sm font-medium px-2 min-w-[100px]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 lg:space-x-2">
                    {/* Playback Speed */}
                    <div className="relative">
                      <button
                        data-playback-button
                        onClick={() => setShowPlaybackMenu(!showPlaybackMenu)}
                        className="px-3 py-1.5 text-white hover:text-purple-400 transition-colors text-sm font-medium rounded-full hover:bg-white/10"
                      >
                        {playbackRate}x
                      </button>
                      {showPlaybackMenu && (
                        <div data-playback-menu className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-xl backdrop-blur-md overflow-hidden min-w-[140px] shadow-xl border border-white/10 z-20">
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                            <button
                              key={rate}
                              onClick={() => handlePlaybackRate(rate)}
                              className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors ${
                                playbackRate === rate ? 'bg-purple-600 text-white' : ''
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={toggleFullScreen} 
                      className="p-2.5 text-white hover:text-purple-400 transition-colors rounded-full hover:bg-white/10"
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 16h3v3h2v-5H5v2zm14-2h-3v-3h-2v5h5v-2zm-5-11h-2v5h5v-2h-3V3zm-7 0H5v2h5V3H7z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm12-4h-2V7h-3V5h5v5zm-7 11h-2v-5H5v5h5v-2zm7-11v-2h-3V5h5v5h-2z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info Section */}
          {!isFullscreen && (
            <div className="bg-white px-4 lg:px-8 py-6 lg:py-8">
              <div className="max-w-4xl mx-auto">
                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900 leading-tight">{video.title}</h1>
                
                {/* Channel Info & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={video.creatorAvatar} 
                      alt={video.creatorName} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200" 
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-base lg:text-lg">{video.creatorName}</p>
                      <p className="text-sm text-gray-600">{formatViews(video.views)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-wrap">
                    <button 
                      onClick={handleSubscribe}
                      className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                        isSubscribed 
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' 
                          : 'bg-black hover:bg-gray-800 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isSubscribed ? '✓ Subscribed' : 'Subscribe'}
                    </button>
                    <button 
                      onClick={handleLike}
                      className={`p-2.5 rounded-full hover:bg-gray-100 transition-all flex items-center space-x-2 ${
                        isLiked ? 'text-red-600' : 'text-gray-700'
                      }`}
                      title={`${likeCount} likes`}
                    >
                      <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {likeCount > 0 && (
                        <span className="text-sm font-semibold">{likeCount > 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}</span>
                      )}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2.5 rounded-full hover:bg-gray-100 transition-all text-gray-700"
                      title="Share"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342c8.53 0 12.316-7.064 12.316-13.18 0-.2-.004-.402-.014-.602a8.875 8.875 0 002.183-2.264 8.028 8.028 0 01-2.47.69 4.125 4.125 0 001.804-2.27 8.143 8.143 0 01-2.6.992 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 01.98 17.55a11.645 11.645 0 01-6.525 1.9c-.42 0-.83-.025-1.235-.075a11.716 11.716 0 006.29 1.843" />
                      </svg>
                    </button>
                    <button 
                      className="p-2.5 rounded-full hover:bg-gray-100 transition-all text-gray-700"
                      title="More options"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-2xl p-5 lg:p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-900">{formatViews(video.views)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{timeAgo(Date.now() - Math.random() * 86400000 * 30)}</span>
                    </div>
                  </div>
                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-line">{video.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Videos Sidebar */}
        {!isFullscreen && (
          <div id="secondary" className="hidden lg:block w-[402px] bg-white border-l border-gray-200 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 56px)' }}>
            <div className="p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4 px-2">Up Next</h2>
              <div className="space-y-3">
                {relatedVideos.map((relatedVideo) => (
                  <div
                    key={relatedVideo.id}
                    onClick={() => navigate(`/watch/${relatedVideo.id}`)}
                    className="flex items-start space-x-3 cursor-pointer group hover:bg-gray-50 rounded-xl p-2 -m-2 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0" style={{ width: '168px', height: '94px' }}>
                      <img
                        src={relatedVideo.thumbnail}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                      />
                      {relatedVideo.type === 'live' && (
                        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-semibold">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          <span>LIVE</span>
                        </div>
                      )}
                      {relatedVideo.type !== 'live' && (
                        <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          10:30
                        </div>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1.5 leading-snug">
                        {relatedVideo.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">{relatedVideo.creatorName}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <span>{formatViews(relatedVideo.views)}</span>
                        <span>•</span>
                        <span>{timeAgo(Date.now() - Math.random() * 86400000 * 30)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
