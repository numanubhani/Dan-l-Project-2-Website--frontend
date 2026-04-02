import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const PRESETS = [10, 50, 100, 500] as const;

/** Dev/test-only: add fake coins locally (not sent to API). */
const AddCoinsModal: React.FC = () => {
  const { addCoinsModalOpen, closeAddCoinsModal, applyDummyWalletTopUp, user } = useAuth();
  const { showSuccess } = useToast();
  const [custom, setCustom] = useState('25');

  useEffect(() => {
    if (addCoinsModalOpen) setCustom('25');
  }, [addCoinsModalOpen]);

  if (!addCoinsModalOpen) return null;

  const balance = typeof user?.balance === 'number' ? user.balance : 0;

  const confirmAmount = (amount: number) => {
    if (amount <= 0 || !Number.isFinite(amount)) return;
    applyDummyWalletTopUp(amount);
    showSuccess(`Added $${amount.toLocaleString()} (test wallet)`);
    closeAddCoinsModal();
  };

  const handleConfirmCustom = () => {
    const n = parseFloat(custom);
    if (Number.isNaN(n) || n <= 0) return;
    confirmAmount(n);
  };

  return (
    <div
      className="fixed inset-0 z-[10020] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-coins-title"
      onClick={closeAddCoinsModal}
    >
      <div
        className="w-full max-w-sm neon-surface rounded-2xl border border-white/[0.12] shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <h2 id="add-coins-title" className="text-base font-black text-white tracking-tight">
              Add coins
            </h2>
            <p className="text-[11px] text-white/45 mt-1 leading-snug">
              Dummy top-up for testing — not charged and not saved to the server.
            </p>
          </div>
          <button
            type="button"
            onClick={closeAddCoinsModal}
            className="shrink-0 w-9 h-9 rounded-xl border border-white/15 bg-white/[0.06] text-white/80 hover:bg-white/10 transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/55 font-medium">Current balance</span>
            <span className="font-black tabular-nums text-[#e9d5ff]">${balance.toLocaleString()}</span>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-white/40 mb-2">Quick add</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => confirmAmount(amt)}
                  className="py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#a855f7]/90 to-[#ec4899]/90 hover:opacity-95 border border-white/10 transition shadow-[0_8px_24px_rgba(168,85,247,0.25)]"
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="add-coins-custom" className="text-[11px] font-bold uppercase tracking-wide text-white/40 block mb-1.5">
              Custom amount
            </label>
            <div className="flex gap-2">
              <input
                id="add-coins-custom"
                type="number"
                min="1"
                step="1"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
              />
              <button
                type="button"
                onClick={handleConfirmCustom}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-white/[0.12] border border-white/15 hover:bg-white/[0.16] transition shrink-0"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCoinsModal;
