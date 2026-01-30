
import React from 'react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onClose }) => {
  return (
    <div className="absolute top-16 right-0 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h3 className="font-bold">Notifications</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">No new notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                  n.type === 'bet_win' ? 'bg-green-500' : n.type === 'bet_loss' ? 'bg-red-500' : 'bg-purple-500'
                }`}></div>
                <div>
                  <p className="text-sm text-zinc-200 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-wider">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 text-center bg-zinc-900/50">
        <button className="text-xs text-purple-400 font-bold hover:text-purple-300">Mark all as read</button>
      </div>
    </div>
  );
};

export default Notifications;
