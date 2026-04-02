import React, { useState } from 'react';
import { BetMarker, Video } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

interface VideoBetBarProps {
  activeBetMarker: BetMarker | null;
  /** Fired after a bet is placed successfully (advance preview or resume). */
  onBetSuccess: () => void;
  relatedVideos: Video[];
  currentVideoId: string;
  onSelectRelated: (videoId: string) => void;
  formatViews: (views: number) => string;
  formatTime: (time: number) => string;
}

const VideoBetBar: React.FC<VideoBetBarProps> = ({
  activeBetMarker,
  onBetSuccess,
  relatedVideos,
  currentVideoId,
  onSelectRelated,
  formatViews,
  formatTime,
}) => {
  const { requireAuth, user, openAddCoinsModal, applyDummyWalletDebit } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handlePlaceBet = () => {
    if (!activeBetMarker) {
      showError('No active bet');
      return;
    }
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
        await api.placeMarkerBet(String(activeBetMarker.id), String(selectedOption), amount, {
          clientBalance: clientBal,
          onTestWalletDebit: applyDummyWalletDebit,
        });
        showSuccess(
          `Bet placed: $${amount} on "${activeBetMarker.options.find((o) => o.id === selectedOption)?.text}"`
        );
        setSelectedOption(null);
        onBetSuccess();
      } catch (err: any) {
        showError(err?.message || 'Failed to place bet');
      } finally {
        setIsPlacingBet(false);
      }
    }, 'place a bet');
  };

  const handleAddCoins = () => openAddCoinsModal();

  React.useEffect(() => {
    if (activeBetMarker) {
      setSelectedOption(null);
      setBetAmount('10');
    }
  }, [activeBetMarker?.id]);

  const balanceDisplay =
    typeof user?.balance === 'number' ? user.balance.toLocaleString() : '0';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2 px-2">
        <h2 className="text-sm font-bold text-white/90 tracking-wide uppercase">Bet bar</h2>
        <button
          type="button"
          onClick={handleAddCoins}
          className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border border-[rgba(168,85,247,0.45)] bg-white/[0.06] text-[#e9d5ff] hover:bg-white/[0.1] transition shrink-0"
        >
          Add coins
        </button>
      </div>

      {activeBetMarker && (
        <div className="neon-surface rounded-2xl p-4 border border-white/[0.12] space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#e9d5ff]/90">
              Active bet · {formatTime(activeBetMarker.timestamp)}
            </p>
            <p className="text-xs text-white/50 mt-2">
              Pool ${activeBetMarker.totalPool.toLocaleString()} · {activeBetMarker.participants} in
            </p>
          </div>

          <div className="space-y-2">
            {activeBetMarker.options.map((option) => (
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
                  (activeBetMarker.options.find((o) => o.id === selectedOption)?.odds || 0)
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
      )}

      <div className="border-t border-white/10 pt-4">
        <h2 className="text-sm font-bold text-white/90 mb-3 px-2 tracking-wide uppercase">Up next</h2>
        <div className="space-y-2">
          {relatedVideos
            .filter((v) => v.id !== currentVideoId)
            .map((relatedVideo) => (
              <div
                key={relatedVideo.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectRelated(relatedVideo.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRelated(relatedVideo.id);
                  }
                }}
                className="flex items-start gap-3 cursor-pointer group rounded-xl p-2 -mx-1 hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/10"
              >
                <div className="relative flex-shrink-0 w-[140px] h-[78px] rounded-lg overflow-hidden">
                  <img
                    src={relatedVideo.thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  {relatedVideo.type === 'live' && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-[#e9d5ff] transition-colors leading-snug">
                    {relatedVideo.title}
                  </h3>
                  <p className="text-[11px] text-white/55 mt-1">{relatedVideo.creatorName}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{formatViews(relatedVideo.views)}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default VideoBetBar;
