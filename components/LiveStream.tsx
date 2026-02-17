
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { User } from '../types';
import { BetIcon, RadioIcon } from './Icons';

interface LiveStreamProps {
  user: User;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const LiveStream: React.FC<LiveStreamProps> = ({ user, onToggleSidebar, sidebarOpen }) => {
  const [isLive, setIsLive] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showSetOdds, setShowSetOdds] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFlashBet, setShowFlashBet] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [viewers, setViewers] = useState(0);
  const [activeBets, setActiveBets] = useState(0);
  const [streamTime, setStreamTime] = useState(0);
  
  // Form states
  const [betQuestion, setBetQuestion] = useState('');
  const [betOptions, setBetOptions] = useState(['', '']);
  const [betDuration, setBetDuration] = useState(60);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Gemini Live Logic
  const sessionRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please allow camera/microphone access to go live.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setStreamTime(prev => prev + 1);
      }, 1000);
    } else {
      setStreamTime(0);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleLive = () => {
    if (!isLive) {
      setIsLive(true);
      setViewers(Math.floor(Math.random() * 500) + 100);
      setActiveBets(12);
    } else {
      setIsLive(false);
      setViewers(0);
      setActiveBets(0);
      if (sessionRef.current) sessionRef.current.close();
    }
  };

  const handleFlashBet = () => {
    setShowFlashBet(true);
    setShowToolbox(false);
  };

  const confirmFlashBet = () => {
    setActiveBets(prev => prev + 1);
    setShowFlashBet(false);
  };

  const handleCreateBet = () => {
    if (betQuestion && betOptions.filter(o => o.trim()).length >= 2) {
      // Create bet logic here
      setShowCreateBet(false);
      setShowToolbox(false);
      setBetQuestion('');
      setBetOptions(['', '']);
      setActiveBets(prev => prev + 1);
    }
  };

  const handleCreatePoll = () => {
    if (pollQuestion && pollOptions.filter(o => o.trim()).length >= 2) {
      // Create poll logic here
      setShowCreatePoll(false);
      setShowToolbox(false);
      setPollQuestion('');
      setPollOptions(['', '']);
    }
  };

  const addBetOption = () => {
    setBetOptions([...betOptions, '']);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const updateBetOption = (index: number, value: string) => {
    const newOptions = [...betOptions];
    newOptions[index] = value;
    setBetOptions(newOptions);
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-zinc-950 to-black overflow-hidden">
      {/* Enhanced Top Status Bar */}
      <div className="relative p-2 sm:p-2.5 lg:p-3 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border-b border-zinc-800/50 backdrop-blur-xl shrink-0 shadow-lg shadow-black/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 overflow-hidden shrink-0 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20">
            <img src={user.avatar} className="w-full h-full object-cover" alt="" />
          </div>
              {isLive && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse shadow-lg shadow-red-500/50"></div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm truncate bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Streaming as {user.name}
              </h2>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${isLive ? 'bg-red-500/20' : 'bg-zinc-800/50'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`}></span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-300 uppercase font-black tracking-widest">
                    {isLive ? 'LIVE' : 'Preview'}
              </span>
            </div>
              </div>
          </div>
        </div>

        {isLive && (
            <div className="hidden sm:flex items-center space-x-3 shrink-0 mx-2 sm:mx-3">
              <div className="text-center px-3 py-1.5 rounded-lg bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 backdrop-blur-sm">
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Viewers</p>
                <p className="text-sm sm:text-base font-black bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  {viewers.toLocaleString()}
                </p>
            </div>
              <div className="text-center px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 backdrop-blur-sm">
                <p className="text-[9px] text-purple-300 font-bold uppercase tracking-wider mb-0.5">Active Bets</p>
                <p className="text-sm sm:text-base font-black text-purple-400">
                  {activeBets}
                </p>
            </div>
          </div>
        )}

        <button 
          onClick={toggleLive}
            className={`relative px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shrink-0 overflow-hidden group ${
            isLive 
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30' 
              : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30'
          }`}
        >
            <span className="relative z-10 flex items-center space-x-1.5">
              {isLive ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                  <span className="hidden sm:inline">End Stream</span>
                  <span className="sm:hidden">End</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="hidden sm:inline">Go Live</span>
                  <span className="sm:hidden">Live</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-3 lg:p-4 gap-2 sm:gap-3 lg:gap-4 min-h-0 h-full">
        {/* Enhanced Main Feed Section */}
        <div className="flex-1 relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/50 min-w-0 min-h-0 max-w-full group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10"></div>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Enhanced Overlay Stats */}
          <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 flex flex-wrap gap-1.5 sm:gap-2 z-20">
            {isLive && (
              <div className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-red-500/30 shadow-lg">
                <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white">LIVE</span>
            </div>
            )}
            <div className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              <span className="text-[10px] sm:text-xs font-bold text-white font-mono">{formatTime(streamTime)}</span>
            </div>
          </div>

          {/* Enhanced Bottom Info Card */}
          <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4 right-2 sm:right-3 lg:right-4 z-20">
            <div className="bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-xl p-2.5 sm:p-3 lg:p-4 rounded-xl border border-white/10 shadow-2xl">
              <h3 className="text-sm sm:text-base lg:text-lg font-black mb-1 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                Testing the new setup! 🚀
              </h3>
              <p className="text-zinc-300 text-[10px] sm:text-xs hidden sm:block">
                Participate in flash bets for a chance to win 500 Pulse Coins!
              </p>
            </div>
          </div>

          {/* Streamer Toolbox Button */}
          <button
            onClick={() => setShowToolbox(true)}
            className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 z-30 p-3 sm:p-3.5 lg:p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 group flex items-center space-x-2 sm:space-x-3"
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
              <BetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-bold text-sm sm:text-base">Streamer</p>
              <p className="text-xs text-green-100">Toolbox</p>
            </div>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Streamer Toolbox Modal */}
          {showToolbox && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setShowToolbox(false)}>
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto sidebar-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="font-bold text-lg sm:text-xl lg:text-2xl flex items-center bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                    <div className="mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                      <BetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                    Streamer Toolbox
                  </h3>
                  <button
                    onClick={() => setShowToolbox(false)}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {/* Betting Section */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-400 tracking-widest mb-2 sm:mb-3 px-1">Betting</h4>
                    <div className="space-y-2 sm:space-y-2.5">
                      <button 
                        onClick={() => {
                          setShowCreateBet(true);
                          setShowToolbox(false);
                        }}
                        className="group w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-3 sm:p-4 rounded-xl text-left border border-purple-500/50 transition-all duration-300 active:scale-[0.98] flex items-center space-x-3 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                      >
                        <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                          <BetIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-base sm:text-lg text-white">Create Bet</p>
                          <p className="text-xs sm:text-sm text-purple-200/80 mt-0.5">Set custom betting event with options and odds</p>
                        </div>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {[
                        { label: 'Trigger Flash Bet', desc: 'Instant yes/no bet for current scene', onClick: handleFlashBet, icon: '⚡' },
                        { label: 'Set Betting Odds', desc: 'Adjust odds for active bets', onClick: () => { setShowSetOdds(true); setShowToolbox(false); }, icon: '📈' },
                        { label: 'End Bet Early', desc: 'Close active bets manually', onClick: () => { alert("End Bet Early"); setShowToolbox(false); }, icon: '⏹️' },
                      ].map((item, idx) => (
                        <button 
                          key={idx}
                          onClick={item.onClick}
                          className="group w-full bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 hover:from-zinc-700/80 hover:to-zinc-800/80 p-3 sm:p-3.5 rounded-xl text-left border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-xl sm:text-2xl">{item.icon}</div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm sm:text-base text-white group-hover:text-zinc-100 transition-colors">{item.label}</p>
                              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 group-hover:text-zinc-300 transition-colors">{item.desc}</p>
                            </div>
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Section */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-400 tracking-widest mb-2 sm:mb-3 px-1">Engagement</h4>
                    <div className="space-y-2 sm:space-y-2.5">
                      {[
                        { label: 'Create Poll', desc: 'Ask your audience a question', onClick: () => { setShowCreatePoll(true); setShowToolbox(false); }, icon: '📊' },
                        { label: 'Highlight Clip', desc: 'Capture the last 30 seconds', onClick: () => { alert("Highlight Clip"); setShowToolbox(false); }, icon: '🎬' },
                      ].map((item, idx) => (
                        <button 
                          key={idx}
                          onClick={item.onClick}
                          className="group w-full bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 hover:from-zinc-700/80 hover:to-zinc-800/80 p-3 sm:p-3.5 rounded-xl text-left border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-xl sm:text-2xl">{item.icon}</div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm sm:text-base text-white group-hover:text-zinc-100 transition-colors">{item.label}</p>
                              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 group-hover:text-zinc-300 transition-colors">{item.desc}</p>
                            </div>
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rewards & Analytics Section */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-400 tracking-widest mb-2 sm:mb-3 px-1">Rewards & Analytics</h4>
                    <div className="space-y-2 sm:space-y-2.5">
                      {[
                        { label: 'Bet Analytics', desc: 'View betting stats & trends', onClick: () => { setShowAnalytics(true); setShowToolbox(false); }, icon: '📉' },
                        { label: 'Shoutout Wheel', desc: 'Reward top bettors with a spin', onClick: () => { alert("Shoutout Wheel"); setShowToolbox(false); }, icon: '🎰' },
                        { label: 'Gift Rain', desc: 'Airdrop coins to active viewers', onClick: () => { alert("Gift Rain"); setShowToolbox(false); }, icon: '🎁' },
                      ].map((item, idx) => (
                        <button 
                          key={idx}
                          onClick={item.onClick}
                          className="group w-full bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 hover:from-zinc-700/80 hover:to-zinc-800/80 p-3 sm:p-3.5 rounded-xl text-left border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-xl sm:text-2xl">{item.icon}</div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm sm:text-base text-white group-hover:text-zinc-100 transition-colors">{item.label}</p>
                              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 group-hover:text-zinc-300 transition-colors">{item.desc}</p>
                            </div>
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Control & Chat Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 2xl:w-96 flex flex-col gap-2 sm:gap-2.5 lg:gap-3 overflow-hidden min-w-0 shrink-0 max-w-full h-full flex-shrink-0">
          {/* Enhanced AI Producer Controls */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-xl p-2.5 sm:p-3 lg:p-4 shrink-0 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-2.5">
              <h4 className="font-bold flex items-center text-sm sm:text-base bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                <div className="mr-1.5 p-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <RadioIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                </div>
                <span className="hidden sm:inline">AI Producer</span>
                <span className="sm:hidden">AI</span>
              </h4>
              <div 
                onClick={() => setIsAiEnabled(!isAiEnabled)}
                className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 shrink-0 ${
                  isAiEnabled 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30' 
                  : 'bg-zinc-700'
                }`}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-transform duration-300 shadow-lg ${isAiEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mb-2 hidden sm:block leading-relaxed">
              Gemini will analyze your video frames to generate hype and suggest bets.
            </p>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-2 sm:p-2.5 rounded-lg border border-purple-500/20 backdrop-blur-sm">
              <p className="text-[10px] sm:text-xs text-purple-300 italic flex items-center space-x-1.5">
                <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
                <span>"AI is currently watching for epic moments..."</span>
              </p>
            </div>
          </div>

          {/* Enhanced Live Chat */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-xl p-2.5 sm:p-3 lg:p-4 flex-1 flex flex-col overflow-hidden min-h-0 max-h-full shadow-xl backdrop-blur-sm">
            <div className="mt-2 sm:mt-2.5 lg:mt-3 pt-3 sm:pt-3.5 border-t border-zinc-800/50 shrink-0">
              <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 rounded-lg p-2 sm:p-2.5 border border-zinc-700/50 backdrop-blur-sm">
                <div className="flex items-center space-x-1.5 mb-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <h5 className="text-[9px] sm:text-[10px] font-black uppercase text-zinc-400 tracking-widest">Live Chat</h5>
                </div>
                <div className="space-y-1.5 h-20 sm:h-24 lg:h-28 overflow-y-auto pr-1.5 text-[10px] sm:text-xs scrollbar-hide sidebar-scrollbar">
                  <div className="flex items-start space-x-1.5 p-1.5 rounded-lg hover:bg-zinc-800/30 transition-colors">
                    <span className="text-purple-400 font-bold shrink-0 text-[10px]">User99:</span>
                    <span className="text-zinc-300 text-[10px]">Let's goooo! 🔥</span>
                  </div>
                  <div className="flex items-start space-x-1.5 p-1.5 rounded-lg hover:bg-zinc-800/30 transition-colors">
                    <span className="text-zinc-400 font-bold shrink-0 text-[10px]">BetBot:</span>
                    <span className="text-zinc-300 text-[10px]">New bet pool started: $450</span>
                  </div>
                  <div className="flex items-start space-x-1.5 p-1.5 rounded-lg hover:bg-zinc-800/30 transition-colors">
                    <span className="text-green-400 font-bold shrink-0 text-[10px]">Mod_Dave:</span>
                    <span className="text-zinc-300 text-[10px]">Be nice in chat everyone!</span>
                  </div>
                  <div className="flex items-start space-x-1.5 p-1.5 rounded-lg hover:bg-zinc-800/30 transition-colors">
                    <span className="text-purple-400 font-bold shrink-0 text-[10px]">Alex_Fan:</span>
                    <span className="text-zinc-300 text-[10px]">Just bet 50 coins on YES!</span>
            </div>
                </div>
                <div className="mt-2 sm:mt-2.5 flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-black/40 border border-zinc-700/50 rounded-lg px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all" 
                  />
                  <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-1.5 sm:p-2 rounded-lg shrink-0 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Bet Modal */}
      {showCreateBet && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateBet(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto sidebar-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="font-bold text-lg sm:text-xl lg:text-2xl flex items-center bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                <div className="mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <BetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                Create Custom Bet
              </h3>
              <button
                onClick={() => setShowCreateBet(false)}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm sm:text-base font-bold text-zinc-300 mb-2">Bet Question</label>
                <input
                  type="text"
                  value={betQuestion}
                  onChange={(e) => setBetQuestion(e.target.value)}
                  placeholder="e.g., Will I land this trick?"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-bold text-zinc-300 mb-2">Bet Options</label>
                <div className="space-y-2 sm:space-y-3">
                  {betOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateBetOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      />
                      {betOptions.length > 2 && (
                        <button
                          onClick={() => setBetOptions(betOptions.filter((_, i) => i !== idx))}
                          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addBetOption}
                    className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-zinc-700/50 hover:border-purple-500/50 text-zinc-400 hover:text-purple-400 transition-all text-sm sm:text-base font-bold"
                  >
                    + Add Option
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-bold text-zinc-300 mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  value={betDuration}
                  onChange={(e) => setBetDuration(Number(e.target.value))}
                  min="10"
                  max="300"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateBet(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBet}
                  disabled={!betQuestion || betOptions.filter(o => o.trim()).length < 2}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-purple-500/20"
                >
                  Create Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreatePoll(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto sidebar-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="font-bold text-lg sm:text-xl lg:text-2xl flex items-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                <div className="mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <span className="text-xl sm:text-2xl">📊</span>
                </div>
                Create Poll
              </h3>
              <button
                onClick={() => setShowCreatePoll(false)}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm sm:text-base font-bold text-zinc-300 mb-2">Poll Question</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g., What should I do next?"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-bold text-zinc-300 mb-2">Poll Options</label>
                <div className="space-y-2 sm:space-y-3">
                  {pollOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updatePollOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addPollOption}
                    className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-zinc-700/50 hover:border-blue-500/50 text-zinc-400 hover:text-blue-400 transition-all text-sm sm:text-base font-bold"
                  >
                    + Add Option
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreatePoll(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePoll}
                  disabled={!pollQuestion || pollOptions.filter(o => o.trim()).length < 2}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-blue-500/20"
                >
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flash Bet Confirmation Modal */}
      {showFlashBet && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFlashBet(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg sm:text-xl flex items-center text-yellow-400">
                <span className="text-2xl sm:text-3xl mr-2">⚡</span>
                Flash Bet
              </h3>
              <button
                onClick={() => setShowFlashBet(false)}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20">
                <p className="text-sm sm:text-base text-zinc-300 mb-2">
                  <span className="font-bold text-yellow-400">Question:</span> Will the streamer land this move?
                </p>
                <p className="text-xs sm:text-sm text-zinc-400">
                  <span className="font-bold">Odds:</span> 2.1x | <span className="font-bold">Duration:</span> 30 seconds
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFlashBet(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFlashBet}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white transition-all font-bold shadow-lg shadow-yellow-500/20"
                >
                  Trigger Flash Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Betting Odds Modal */}
      {showSetOdds && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSetOdds(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto sidebar-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="font-bold text-lg sm:text-xl lg:text-2xl flex items-center bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                <div className="mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <span className="text-xl sm:text-2xl">📈</span>
                </div>
                Set Betting Odds
              </h3>
              <button
                onClick={() => setShowSetOdds(false)}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                <p className="text-sm sm:text-base text-zinc-300 mb-4">Active Bets</p>
                <div className="space-y-3">
                  {[
                    { id: '1', question: 'Will I land this trick?', option1: 'Yes (1.8x)', option2: 'No (2.2x)' },
                    { id: '2', question: 'Will I complete the challenge?', option1: 'Yes (2.5x)', option2: 'No (1.5x)' },
                  ].map((bet) => (
                    <div key={bet.id} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/30">
                      <p className="text-xs sm:text-sm font-bold text-white mb-2">{bet.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                          <span className="text-xs text-zinc-300">{bet.option1}</span>
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={bet.option1.match(/\(([\d.]+)x\)/)?.[1] || '1.8'}
                            className="w-16 bg-zinc-700/50 border border-zinc-600/50 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500/50"
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                          <span className="text-xs text-zinc-300">{bet.option2}</span>
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={bet.option2.match(/\(([\d.]+)x\)/)?.[1] || '2.2'}
                            className="w-16 bg-zinc-700/50 border border-zinc-600/50 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSetOdds(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Odds updated successfully!");
                    setShowSetOdds(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white transition-all font-bold shadow-lg shadow-green-500/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bet Analytics Modal */}
      {showAnalytics && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAnalytics(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto sidebar-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="font-bold text-lg sm:text-xl lg:text-2xl flex items-center bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                <div className="mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <span className="text-xl sm:text-2xl">📉</span>
                </div>
                Bet Analytics
              </h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-3 sm:p-4 border border-purple-500/30">
                <p className="text-xs sm:text-sm text-purple-300 font-bold uppercase mb-1">Total Bets</p>
                <p className="text-2xl sm:text-3xl font-black text-white">1,247</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-3 sm:p-4 border border-green-500/30">
                <p className="text-xs sm:text-sm text-green-300 font-bold uppercase mb-1">Total Volume</p>
                <p className="text-2xl sm:text-3xl font-black text-white">$45.2K</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl p-3 sm:p-4 border border-blue-500/30">
                <p className="text-xs sm:text-sm text-blue-300 font-bold uppercase mb-1">Avg. Payout</p>
                <p className="text-2xl sm:text-3xl font-black text-white">2.3x</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                <h4 className="text-sm sm:text-base font-bold text-white mb-3">Recent Betting Activity</h4>
                <div className="space-y-2">
                  {[
                    { question: 'Will I land this trick?', volume: '$1,250', participants: 89, status: 'Active' },
                    { question: 'Will I complete the challenge?', volume: '$890', participants: 56, status: 'Completed' },
                    { question: 'Will I break the record?', volume: '$2,100', participants: 134, status: 'Active' },
                  ].map((bet, idx) => (
                    <div key={idx} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/30">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs sm:text-sm font-bold text-white flex-1">{bet.question}</p>
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold ${
                          bet.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700/50 text-zinc-400'
                        }`}>
                          {bet.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-[10px] sm:text-xs text-zinc-400">
                        <span>Volume: <span className="text-purple-400 font-bold">{bet.volume}</span></span>
                        <span>Participants: <span className="text-blue-400 font-bold">{bet.participants}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStream;
