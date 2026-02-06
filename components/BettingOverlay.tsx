
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
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                {event.participants} betting
              </span>
              <span>Pool: <span className="text-purple-400 font-bold">${event.totalPool}</span></span>
            </div>
          </div>
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

          {event.options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
                selectedOption === option.id 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
              }`}
            >
            </button>
          ))}
        </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
              {[10, 50, 100].map(val => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>
        </div>

            Ends in: <span className="text-white font-mono">{formatTime(timeLeft)}</span>
          </div>
            Potential Payout: <span className="text-green-400 font-bold">${(amount * (event.options.find(o => o.id === selectedOption)?.odds || 0)).toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={!selectedOption || amount <= 0 || amount > user.balance}
          onClick={() => selectedOption && onPlaceBet(selectedOption, amount)}
        >
          {amount > user.balance ? 'Insufficient Funds' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
};

export default BettingOverlay;
