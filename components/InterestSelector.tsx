import React, { useState } from 'react';
import { createPortal } from 'react-dom';

/* ── Persistent helpers ─────────────────────────────────────────────── */

export const INTERESTS_KEY = 'vpulse_interests';

export const getStoredInterests = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(INTERESTS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveInterests = (ids: string[]): void => {
  localStorage.setItem(INTERESTS_KEY, JSON.stringify(ids));
};

/* ── Category data ──────────────────────────────────────────────────── */

export interface Category {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

export const CATEGORIES: Category[] = [
  { id: 'animals',    label: 'Animals',             emoji: '🐾', gradient: 'from-orange-400 to-amber-500'   },
  { id: 'comedy',     label: 'Comedy',              emoji: '😂', gradient: 'from-yellow-400 to-orange-400'  },
  { id: 'travel',     label: 'Travel',              emoji: '🏞️', gradient: 'from-teal-400 to-cyan-500'     },
  { id: 'food',       label: 'Food',                emoji: '🍔', gradient: 'from-red-400 to-orange-500'     },
  { id: 'sports',     label: 'Sports',              emoji: '⚽', gradient: 'from-green-400 to-emerald-500'  },
  { id: 'beauty',     label: 'Beauty & Style',      emoji: '💄', gradient: 'from-pink-400 to-rose-500'      },
  { id: 'art',        label: 'Art',                 emoji: '🎨', gradient: 'from-purple-400 to-violet-500'  },
  { id: 'gaming',     label: 'Gaming',              emoji: '🕹️', gradient: 'from-blue-500 to-purple-600'   },
  { id: 'science',    label: 'Science & Education', emoji: '💯', gradient: 'from-sky-400 to-blue-500'       },
  { id: 'dance',      label: 'Dance',               emoji: '💃', gradient: 'from-pink-500 to-fuchsia-600'   },
  { id: 'diy',        label: 'DIY',                 emoji: '🔨', gradient: 'from-amber-400 to-yellow-500'   },
  { id: 'auto',       label: 'Auto',                emoji: '🚗', gradient: 'from-slate-400 to-blue-500'     },
  { id: 'music',      label: 'Music',               emoji: '🎹', gradient: 'from-indigo-400 to-purple-500'  },
  { id: 'lifehacks',  label: 'Life Hacks',          emoji: '💡', gradient: 'from-yellow-300 to-amber-400'   },
  { id: 'satisfying', label: 'Oddly Satisfying',    emoji: '💕', gradient: 'from-purple-300 to-pink-500'    },
  { id: 'outdoors',   label: 'Outdoors',            emoji: '🥾', gradient: 'from-green-500 to-teal-600'     },
  { id: 'fandom',     label: 'Fandom',              emoji: '💖', gradient: 'from-rose-400 to-pink-600'      },
];

const MIN_SELECTIONS = 3;

/* ── Component ──────────────────────────────────────────────────────── */

interface InterestSelectorProps {
  onComplete: () => void;
}

const InterestSelector: React.FC<InterestSelectorProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    saveInterests([...selected]);
    onComplete();
  };

  const canContinue = selected.size >= MIN_SELECTIONS;
  const remaining = MIN_SELECTIONS - selected.size;

  const modal = (
    <div className="fixed inset-0 z-[10000] bg-[#0e0e0e] flex flex-col">

      {/* ── Header ── */}
      <div className="shrink-0 px-5 pt-10 pb-5 text-center border-b border-white/[0.06]">
        {/* Logo */}
        <div className="w-11 h-11 bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FE2C55]/30">
          <span className="text-xl font-black italic text-white leading-none">V</span>
        </div>

        <h1 className="text-[22px] font-black text-white tracking-tight leading-snug">
          What would you like to watch<br className="hidden sm:block" /> on VPulse?
        </h1>

        <p className="text-[13px] text-white/45 mt-2">
          {canContinue
            ? <span><span className="text-[#FE2C55] font-semibold">{selected.size} selected</span> — tap Continue when ready</span>
            : <>Select <span className="text-white/70 font-semibold">{MIN_SELECTIONS} or more</span> to personalise your feed</>
          }
        </p>
      </div>

      {/* ── Scrollable category grid ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-5 pb-32">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-w-2xl mx-auto">
          {CATEGORIES.map(cat => {
            const isSelected = selected.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className={`relative flex flex-col items-center gap-2.5 p-2.5 rounded-2xl border-2 transition-all duration-150 active:scale-95 select-none ${
                  isSelected
                    ? 'border-[#FE2C55] bg-[#FE2C55]/[0.12] scale-[1.03]'
                    : 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Emoji tile */}
                <div
                  className={`w-full aspect-square rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-md`}
                >
                  <span className="text-[32px] sm:text-[38px] leading-none">{cat.emoji}</span>
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold text-center leading-tight transition-colors ${
                    isSelected ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {cat.label}
                </span>

                {/* Checkmark badge */}
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#FE2C55] rounded-full flex items-center justify-center shadow-md pointer-events-none">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Fixed footer CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pt-6 pb-6 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/95 to-transparent pointer-events-none">
        <div className="max-w-sm mx-auto pointer-events-auto space-y-2">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-3.5 rounded-full font-bold text-[15px] tracking-wide transition-all duration-200 ${
              canContinue
                ? 'bg-[#FE2C55] hover:bg-[#e6254b] text-white shadow-lg shadow-[#FE2C55]/25'
                : 'bg-white/[0.08] text-white/30 cursor-not-allowed'
            }`}
          >
            {canContinue
              ? `Continue`
              : `Select ${remaining} more to continue`
            }
          </button>
          <p className="text-center text-[10px] text-white/25 pt-1">
            You can update your interests anytime from your profile
          </p>
        </div>
      </div>

    </div>
  );

  return createPortal(modal, document.body);
};

export default InterestSelector;
