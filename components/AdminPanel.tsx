
import React, { useState } from 'react';
import { MOCK_VIDEOS } from '../constants';
import { moderateVideo } from '../services/geminiService';

const AdminPanel: React.FC = () => {
  const [queue, setQueue] = useState(MOCK_VIDEOS);
  const [checking, setChecking] = useState<string | null>(null);

  const handleModerate = async (id: string, title: string, desc: string) => {
    setChecking(id);
    const result = await moderateVideo(title, desc);
    alert(`AI Analysis: \nSafety Score: ${result.score}\nReason: ${result.reason}\nSafe: ${result.isSafe ? 'YES' : 'NO'}`);
    setChecking(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-black mb-8 border-b border-zinc-800 pb-4">Content Moderation Queue</h2>
      
      <div className="space-y-6">
        {queue.map(video => (
          <div key={video.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
                <img src={video.thumbnail} className="w-full h-full object-cover opacity-50" alt="" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
                        <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">New Submission</span>
                    <span className="text-xs text-zinc-500">2 mins ago</span>
                </div>
                <h3 className="text-xl font-bold">{video.title}</h3>
                <p className="text-zinc-400 text-sm line-clamp-2">{video.description}</p>
              </div>

              <div className="flex items-center space-x-3">
                <img src={video.creatorAvatar} className="w-8 h-8 rounded-full" alt="" />
                <span className="text-sm font-medium">@{video.creatorName}</span>
                <span className="text-zinc-600 px-2">•</span>
                <span className="text-sm text-zinc-500 capitalize">{video.type} format</span>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button 
                  onClick={() => handleModerate(video.id, video.title, video.description)}
                  disabled={checking === video.id}
                  className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {checking === video.id ? 'Analyzing...' : 'AI Scan'}
                </button>
                <button className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">
                  Approve
                </button>
                <button className="px-6 py-2 bg-red-600/10 text-red-500 border border-red-500/30 font-bold rounded-lg hover:bg-red-600/20 transition">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
