
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { User } from '../types';

const data = [
  { name: 'Mon', earnings: 400, bets: 2400 },
  { name: 'Tue', earnings: 300, bets: 1398 },
  { name: 'Wed', earnings: 200, bets: 9800 },
  { name: 'Thu', earnings: 278, bets: 3908 },
  { name: 'Fri', earnings: 189, bets: 4800 },
  { name: 'Sat', earnings: 239, bets: 3800 },
  { name: 'Sun', earnings: 349, bets: 4300 },
];

const CreatorDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadProgress(1);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowUpload(false);
            setUploadProgress(0);
            alert("Video uploaded successfully and sent to moderation!");
          }, 500);
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Creator Hub</h1>
          <p className="text-zinc-400 text-lg">Manage your content, bets, and earnings.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowUpload(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-2xl flex items-center shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Upload Video
          </button>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-purple-500/30 group relative">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Total Balance</p>
            <p className="text-2xl font-black text-purple-400">${user.balance.toLocaleString()}</p>
            <button className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">WITHDRAW</button>
          </div>
        </div>
      </header>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Upload New Content</h2>
              <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              {uploadProgress > 0 ? (
                <div className="py-20 text-center">
                  <div className="w-full bg-zinc-800 rounded-full h-4 mb-4 overflow-hidden">
                    <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-zinc-400 font-bold">Uploading... {uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Video Title</label>
                        <input type="text" placeholder="e.g. Insane Trickshot" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-purple-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Description</label>
                        <textarea rows={3} placeholder="Tell your audience about the video..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-purple-500 resize-none"></textarea>
                      </div>
                    </div>
                    
                    <div className="border-2 border-dashed border-zinc-700 rounded-3xl flex flex-col items-center justify-center p-6 bg-zinc-800/30 hover:bg-zinc-800/50 transition cursor-pointer">
                      <svg className="w-12 h-12 text-zinc-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="text-sm font-bold text-zinc-400">Drag & Drop Video</p>
                      <p className="text-[10px] text-zinc-600 mt-1">MP4, MOV up to 500MB</p>
                    </div>
                  </div>

                  <div className="bg-purple-500/5 border border-purple-500/20 p-6 rounded-2xl">
                    <h3 className="font-bold mb-4 flex items-center text-purple-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Setup Betting Event
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Betting Question</label>
                        <input type="text" placeholder="Will I land the jump?" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-purple-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Option A (e.g. Yes)" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm" />
                        <input type="text" placeholder="Option B (e.g. No)" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl font-black text-lg transition-all shadow-xl shadow-purple-500/20">
                    Submit Content
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
          <h3 className="text-xl font-bold mb-6">Earnings Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Line type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
          <h3 className="text-xl font-bold mb-6">Bet Activity</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px' }}
                />
                <Bar dataKey="bets" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Videos', val: '24' },
          { label: 'Active Bets', val: '8' },
          { label: 'Total Viewers', val: '1.2M' },
          { label: 'Avg Payout/Vid', val: '$450' }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-purple-500/50 transition">
            <p className="text-zinc-500 text-sm font-bold uppercase mb-2">{stat.label}</p>
            <p className="text-3xl font-black">{stat.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorDashboard;
