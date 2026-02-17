
import React, { useState, useEffect } from 'react';
import { BetEvent, User } from '../types';

interface BettingOverlayProps {
  event: BetEvent;
  user: User;
  onPlaceBet: (optionId: string, amount: number) => void;
  onClose: () => void;
}

const BettingOverlay: React.FC<BettingOverlayProps> = ({ event, user, onPlaceBet, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, event.expiresAt - Date.now());
      setTimeLeft(diff);
      if (diff === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [event.expiresAt]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col justify-end z-[200] animate-in slide-in-from-bottom duration-300">
      <div className="bg-zinc-900 rounded-t-3xl p-4 lg:p-6 border-t border-purple-500/30 max-h-[85vh] lg:max-h-[90vh] overflow-y-auto pb-20 lg:pb-6 scrollbar-hide">
        <div className="flex justify-between items-start mb-4 lg:mb-6">
          <div className="flex-1 pr-2">
            <h3 className="text-lg lg:text-xl font-bold text-white mb-1">{event.question}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 text-xs sm:text-sm text-zinc-400">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                {event.participants} betting
              </span>
              <span>Pool: <span className="text-purple-400 font-bold">${event.totalPool}</span></span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition shrink-0">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
          {event.options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full p-3 lg:p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                selectedOption === option.id 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
              }`}
            >
              <span className="font-semibold text-sm lg:text-base pr-2">{option.text}</span>
              <span className="text-purple-400 font-mono text-sm lg:text-base shrink-0">x{option.odds}</span>
            </button>
          ))}
        </div>

        <div className="mb-4 lg:mb-6">
          <label className="block text-xs lg:text-sm text-zinc-400 mb-2">Bet Amount (Available: ${user.balance})</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-purple-500 font-bold text-lg lg:text-xl"
            />
            <div className="flex space-x-2 shrink-0">
              {[10, 50, 100].map(val => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)}
                  className="px-3 lg:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs lg:text-sm border border-zinc-700 transition"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <div className="text-xs lg:text-sm font-medium text-zinc-500">
            Ends in: <span className="text-white font-mono">{formatTime(timeLeft)}</span>
          </div>
          <div className="text-xs lg:text-sm text-zinc-400">
            Potential Payout: <span className="text-green-400 font-bold">${(amount * (event.options.find(o => o.id === selectedOption)?.odds || 0)).toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={!selectedOption || amount <= 0 || amount > user.balance}
          onClick={() => selectedOption && onPlaceBet(selectedOption, amount)}
          className="w-full py-3 lg:py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl font-bold text-base lg:text-lg shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          {amount > user.balance ? 'Insufficient Funds' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
};

export default BettingOverlay;
