
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { User } from '../types';
import { BetIcon, RadioIcon } from './Icons';

interface LiveStreamProps {
  user: User;
}

const LiveStream: React.FC<LiveStreamProps> = ({ user }) => {
  const [isLive, setIsLive] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [viewers, setViewers] = useState(0);
  const [activeBets, setActiveBets] = useState(0);

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
    alert("Flash Bet Triggered! 'Will the streamer land this move?' Odds: 2.1x");
    setActiveBets(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top Status Bar */}
      <div className="p-4 bg-zinc-900 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-purple-500 overflow-hidden">
            <img src={user.avatar} className="w-full h-full object-cover" alt="" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Streaming as {user.name}</h2>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`}></span>
              <span className="text-xs text-zinc-400 uppercase font-black tracking-widest">
                {isLive ? 'Live' : 'Preview Mode'}
              </span>
            </div>
          </div>
        </div>

        {isLive && (
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Viewers</p>
              <p className="text-lg font-black text-white">{viewers}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Active Bets</p>
              <p className="text-lg font-black text-purple-400">{activeBets}</p>
            </div>
          </div>
        )}

        <button 
          onClick={toggleLive}
          className={`px-8 py-2 rounded-xl font-bold transition-all ${
            isLive 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isLive ? 'End Stream' : 'Go Live Now'}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        {/* Main Feed Section */}
        <div className="flex-1 relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay Stats */}
          <div className="absolute top-6 left-6 flex space-x-2">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-2 border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Live</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
              00:14:52
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-black mb-1">Testing the new setup! 🚀</h3>
              <p className="text-zinc-300 text-sm">Participate in flash bets for a chance to win 500 Pulse Coins!</p>
            </div>
          </div>
        </div>

        {/* Control & Chat Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden">
          {/* AI Producer Controls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold flex items-center">
                <RadioIcon className="w-5 h-5 mr-2 text-purple-500" />
                AI Producer
              </h4>
              <div 
                onClick={() => setIsAiEnabled(!isAiEnabled)}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isAiEnabled ? 'bg-purple-600' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isAiEnabled ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Gemini will analyze your video frames to generate hype and suggest bets.</p>
            <div className="bg-black/50 p-3 rounded-lg border border-zinc-800">
              <p className="text-xs text-purple-300 italic">"AI is currently watching for epic moments..."</p>
            </div>
          </div>

          {/* Streamer Actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
            <h4 className="font-bold mb-4 flex items-center shrink-0">
              <BetIcon className="w-5 h-5 mr-2 text-green-500" />
              Streamer Toolbox
            </h4>
            
            <div className="space-y-3 overflow-y-auto pr-2 flex-1 scroll-smooth scrollbar-hide">
              <button 
                onClick={handleFlashBet}
                className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left border border-zinc-700 transition active:scale-95 shrink-0"
              >
                <p className="font-bold text-sm">Trigger Flash Bet</p>
                <p className="text-xs text-zinc-500">Instant yes/no bet for current scene</p>
              </button>
              
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left border border-zinc-700 transition active:scale-95 shrink-0">
                <p className="font-bold text-sm">Pin New Poll</p>
                <p className="text-xs text-zinc-500">Ask your audience a question</p>
              </button>

              <button className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left border border-zinc-700 transition active:scale-95 shrink-0">
                <p className="font-bold text-sm">Shoutout Wheel</p>
                <p className="text-xs text-zinc-500">Reward top bettors with a spin</p>
              </button>

              <button className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left border border-zinc-700 transition active:scale-95 shrink-0">
                <p className="font-bold text-sm">Highlight Clip</p>
                <p className="text-xs text-zinc-500">Capture the last 30 seconds</p>
              </button>

              <button className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl text-left border border-zinc-700 transition active:scale-95 shrink-0">
                <p className="font-bold text-sm">Gift Rain</p>
                <p className="text-xs text-zinc-500">Airdrop coins to active viewers</p>
              </button>
            </div>

            <div className="mt-4 pt-6 border-t border-zinc-800 shrink-0">
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <h5 className="text-[10px] font-black uppercase text-zinc-500 mb-2">Live Chat</h5>
                <div className="space-y-2 h-32 overflow-y-auto pr-2 text-sm scrollbar-hide">
                  <p><span className="text-purple-400 font-bold">User99:</span> Let's goooo! 🔥</p>
                  <p><span className="text-zinc-400 font-bold">BetBot:</span> New bet pool started: $450</p>
                  <p><span className="text-green-400 font-bold">Mod_Dave:</span> Be nice in chat everyone!</p>
                  <p><span className="text-purple-400 font-bold">Alex_Fan:</span> Just bet 50 coins on YES!</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500" 
                  />
                  <button className="bg-purple-600 p-2 rounded-lg">
                    <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
