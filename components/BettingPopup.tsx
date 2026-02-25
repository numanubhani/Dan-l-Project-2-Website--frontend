import React, { useState } from 'react';
import { BetMarker } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface BettingPopupProps {
  betMarker: BetMarker;
  onClose: () => void;
  onBetPlaced?: () => void;
}

const BettingPopup: React.FC<BettingPopupProps> = ({ betMarker, onClose, onBetPlaced }) => {
  const { requireAuth } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handlePlaceBet = () => {
    if (!selectedOption) {
      showError('Please select an option');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      showError('Please enter a valid bet amount');
      return;
    }

    requireAuth(() => {
      setIsPlacingBet(true);
      // Simulate API call
      setTimeout(() => {
        setIsPlacingBet(false);
        showSuccess(`Bet placed: $${amount} on "${betMarker.options.find(o => o.id === selectedOption)?.text}"`);
        onBetPlaced?.();
        onClose();
      }, 1000);
    }, 'place a bet');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-black text-white">Place Your Bet</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-purple-100 text-sm font-bold">At {formatTime(betMarker.timestamp)}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">{betMarker.question}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Pool: ${betMarker.totalPool.toLocaleString()}</span>
              <span>•</span>
              <span>{betMarker.participants} participants</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {betMarker.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedOption === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">{option.text}</p>
                    <p className="text-sm text-gray-500 mt-1">Odds: {option.odds.toFixed(2)}x</p>
                  </div>
                  {selectedOption === option.id && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Bet Amount */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Bet Amount ($)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              step="1"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-bold text-gray-900"
              placeholder="Enter amount"
            />
            {selectedOption && (
              <p className="text-sm text-gray-500 mt-2">
                Potential win: ${(parseFloat(betAmount) * betMarker.options.find(o => o.id === selectedOption)?.odds || 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Skip
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={!selectedOption || isPlacingBet}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingBet ? 'Placing...' : 'Place Bet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingPopup;

