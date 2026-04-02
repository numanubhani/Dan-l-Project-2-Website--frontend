import React, { useState, useEffect } from 'react';
import { BetMarker } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

interface BettingPopupProps {
  betMarker: BetMarker;
  /** Called only after a successful bet. Popup cannot be dismissed without betting. */
  onBetPlaced: () => void;
}

const BettingPopup: React.FC<BettingPopupProps> = ({ betMarker, onBetPlaced }) => {
  const { requireAuth, user, openAddCoinsModal, applyDummyWalletDebit } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const balanceDisplay =
    typeof user?.balance === 'number' ? user.balance.toLocaleString() : '0';

  useEffect(() => {
    setSelectedOption(null);
    setBetAmount('10');
  }, [betMarker.id]);

  const handleAddCoins = () => openAddCoinsModal();

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

    requireAuth(async () => {
      setIsPlacingBet(true);
      try {
        const clientBal = Number(user?.balance ?? 0);
        await api.placeMarkerBet(String(betMarker.id), String(selectedOption), amount, {
          clientBalance: clientBal,
          onTestWalletDebit: applyDummyWalletDebit,
        });
        showSuccess(`Bet placed: $${amount} on "${betMarker.options.find(o => o.id === selectedOption)?.text}"`);
        onBetPlaced();
      } catch (err: any) {
        showError(err.message || 'Failed to place bet');
      } finally {
        setIsPlacingBet(false);
      }
    }, 'place a bet');
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 pointer-events-auto"
      aria-modal="true"
      role="dialog"
    >
      <div className="neon-surface w-full max-w-md border border-white/[0.12] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#e9d5ff]/90">
            Active bet · {formatTime(betMarker.timestamp)}
          </p>
          <button
            type="button"
            onClick={handleAddCoins}
            className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border border-[rgba(168,85,247,0.45)] bg-white/[0.06] text-[#e9d5ff] hover:bg-white/[0.1] transition shrink-0"
          >
            Add coins
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-white/50">
            Pool ${betMarker.totalPool.toLocaleString()} · {betMarker.participants} in
          </p>

          <div className="space-y-2">
            {betMarker.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedOption === option.id
                    ? 'border-[#a855f7]/70 bg-[#a855f7]/15 shadow-[0_0_0_1px_rgba(168,85,247,0.35)]'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{option.text}</span>
                  <span className="text-xs font-bold text-[#e9d5ff]/80">{option.odds.toFixed(2)}x</span>
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-white/55 mb-1.5">
              Stake ($)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              step="1"
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
            />
            {selectedOption && (
              <p className="text-xs text-white/45 mt-1.5">
                Potential win: $
                {(
                  parseFloat(betAmount || '0') *
                  (betMarker.options.find((o) => o.id === selectedOption)?.odds || 0)
                ).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 px-0.5">
            <span>Balance</span>
            <span className="font-bold text-white/90">${balanceDisplay}</span>
          </div>

          <button
            type="button"
            onClick={handlePlaceBet}
            disabled={!selectedOption || isPlacingBet}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:opacity-95 disabled:opacity-45 disabled:cursor-not-allowed transition shadow-[0_8px_24px_rgba(168,85,247,0.35)]"
          >
            {isPlacingBet ? 'Placing…' : 'Place bet'}
          </button>

          <button
            type="button"
            onClick={handleAddCoins}
            className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-[#e9d5ff] border border-dashed border-white/20 hover:border-[#a855f7]/50 hover:bg-white/[0.04] transition"
          >
            + Add coins to wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default BettingPopup;
