
import React, { useState } from 'react';

// Types
interface Market {
  id: string;
  title: string;
  category: string;
  options: { label: string; probability: number; color: 'green' | 'red' }[];
  volume: string;
  isLive?: boolean;
  avatar?: string;
}

// Mock Data
const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    title: 'Fed decision in March?',
    category: 'Finance',
    options: [
      { label: '25bps decrease', probability: 45, color: 'green' },
      { label: '50+ bps decrease', probability: 55, color: 'green' }
    ],
    volume: '$2.4M',
    isLive: true
  },
  {
    id: '2',
    title: 'What price will Bitcoin hit in February?',
    category: 'Crypto',
    options: [
      { label: '$50K+', probability: 38, color: 'green' },
      { label: 'Below $50K', probability: 62, color: 'red' }
    ],
    volume: '$5.1M',
    isLive: true
  },
  {
    id: '3',
    title: 'BTC 5 Minute Up or Down',
    category: 'Crypto',
    options: [
      { label: 'Up', probability: 51, color: 'green' },
      { label: 'Down', probability: 49, color: 'red' }
    ],
    volume: '$890K',
    isLive: true
  },
  {
    id: '4',
    title: 'US strikes Iran by Feb 27?',
    category: 'Politics',
    options: [
      { label: 'Yes', probability: 23, color: 'green' },
      { label: 'No', probability: 77, color: 'red' }
    ],
    volume: '$12.3M',
    isLive: false
  },
  {
    id: '5',
    title: 'S&P 500 opens up or down?',
    category: 'Finance',
    options: [
      { label: 'Up', probability: 58, color: 'green' },
      { label: 'Down', probability: 42, color: 'red' }
    ],
    volume: '$3.7M',
    isLive: true
  },
  {
    id: '6',
    title: 'Trump wins 2024 election?',
    category: 'Politics',
    options: [
      { label: 'Yes', probability: 52, color: 'green' },
      { label: 'No', probability: 48, color: 'red' }
    ],
    volume: '$45.2M',
    isLive: false
  },
  {
    id: '7',
    title: 'Ethereum hits $4000 by March?',
    category: 'Crypto',
    options: [
      { label: 'Yes', probability: 34, color: 'green' },
      { label: 'No', probability: 66, color: 'red' }
    ],
    volume: '$1.8M',
    isLive: true
  },
  {
    id: '8',
    title: 'Oscars Best Picture winner?',
    category: 'Entertainment',
    options: [
      { label: 'Oppenheimer', probability: 65, color: 'green' },
      { label: 'Other', probability: 35, color: 'red' }
    ],
    volume: '$890K',
    isLive: false
  }
];

// Reusable Button Component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'green' | 'red' | 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseClasses = 'px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    primary: 'bg-purple-400 hover:bg-purple-500 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Progress Indicator Component
interface ProgressIndicatorProps {
  percentage: number;
  color: 'green' | 'red';
  label: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ percentage, color, label }) => {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] sm:text-xs font-bold text-gray-700 truncate mr-2">{label}</span>
        <span className={`text-[10px] sm:text-xs font-black shrink-0 ${color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Market Card Component
interface MarketCardProps {
  market: Market;
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5 sm:mb-3">
        <div className="flex items-start space-x-2 sm:space-x-2.5 flex-1 min-w-0">
          {market.avatar ? (
            <img src={market.avatar} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0" alt="" />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shrink-0">
              <span className="text-[10px] sm:text-xs font-black text-white">M</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 mb-0.5 sm:mb-1">
              {market.isLive && (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] sm:text-[9px] text-red-400 font-black uppercase tracking-wider">LIVE</span>
                </div>
              )}
              <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase">{market.category}</span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">
              {market.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-0.5 ml-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Filter action
            }}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-yellow-400 bg-yellow-400/10'
                : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 opacity-0 group-hover:opacity-100'
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Options with Progress */}
      <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-3.5">
        {market.options.map((option, idx) => (
          <ProgressIndicator
            key={idx}
            percentage={option.probability}
            color={option.color}
            label={option.label}
          />
        ))}
      </div>

      {/* Volume and Actions */}
      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-zinc-800">
        <div className="text-[10px] sm:text-xs text-gray-500">
          <span className="font-bold text-gray-700">{market.volume}</span> Vol
        </div>
        <div className="flex items-center space-x-1.5">
          {market.options.map((option, idx) => (
            <Button
              key={idx}
              variant={option.color}
              onClick={() => alert(`Bet on ${option.label}`)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Market Grid Component
interface MarketGridProps {
  markets: Market[];
}

const MarketGrid: React.FC<MarketGridProps> = ({ markets }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
};

// Category Tabs Component
interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="overflow-x-auto scrollbar-hide mb-4 sm:mb-5">
      <div className="flex space-x-1.5 sm:space-x-2 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs whitespace-nowrap transition-all duration-200 ${
              activeCategory === category
                ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md shadow-purple-400/30'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Navbar Component
interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, onSearchChange }) => {
  const menuItems = ['Trending', 'Breaking', 'New', 'Politics', 'Sports', 'Crypto', 'Finance'];

  return (
    <nav className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900 border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-400/30">
            <span className="text-lg sm:text-2xl font-black italic text-white">V</span>
          </div>
          <span className="text-lg sm:text-2xl font-black tracking-tighter text-gray-900">VPULSE</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search markets..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm transition"
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <button
                key={item}
                className="px-3 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button className="hidden sm:block px-3 sm:px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              How it works
            </button>
            {!user && (
              <>
                <button className="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  Login
                </button>
                <Button variant="primary" className="px-4 sm:px-6 py-2 text-xs sm:text-sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Loading Skeleton Component
const MarketCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 animate-pulse">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
          <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-2 bg-zinc-800 rounded"></div>
        <div className="h-2 bg-zinc-800 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="h-4 bg-zinc-800 rounded w-20"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-zinc-800 rounded w-16"></div>
          <div className="h-8 bg-zinc-800 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

// Main Prediction Market Component
interface PredictionMarketProps {
  onBack?: () => void;
  user?: any;
}

const PredictionMarket: React.FC<PredictionMarketProps> = ({ onBack, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const categories = ['All', 'Trump', 'Iran', 'Olympics', 'Gov Shutdown', 'Oscars', 'Crypto', 'Tech'];

  // Filter markets based on category and search
  const filteredMarkets = MOCK_MARKETS.filter((market) => {
    const matchesCategory = activeCategory === 'All' || market.category.toLowerCase() === activeCategory.toLowerCase() || market.title.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = searchQuery === '' || market.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full w-full bg-white text-gray-900 overflow-y-auto overflow-x-hidden">
      {/* Top Bar with Search and Menu */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 backdrop-blur-xl shadow-sm">
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Mobile Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden mr-2 sm:mr-3 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors border border-gray-300 hover:border-purple-400 flex items-center space-x-1.5 font-bold text-sm"
                aria-label="Go back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
            )}
            
            {/* Logo/Title on Mobile */}
            <div className="lg:hidden flex items-center space-x-2 flex-1">
              <div className="w-7 h-7 bg-purple-400 rounded-lg flex items-center justify-center shadow-lg shadow-purple-400/30">
                <span className="text-base font-black italic text-white">V</span>
              </div>
              <span className="text-base font-black tracking-tighter text-gray-900">VPULSE</span>
            </div>
            
            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mr-2 sm:mr-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search markets..."
                  className="block w-full pl-8 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-xs sm:text-sm transition"
                />
              </div>
            </div>

            {/* Mobile Search Icon Button - Top Right */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors border border-gray-300 hover:border-purple-400"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Menu Items */}
            <div className="hidden lg:flex items-center space-x-0.5 ml-4">
              {['Trending', 'Breaking', 'New', 'Politics', 'Sports', 'Crypto', 'Finance'].map((item) => (
                <button
                  key={item}
                  className="px-2 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 ml-2 sm:ml-3 shrink-0">
              <button className="hidden sm:block px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                How it works
              </button>
              {!user && (
                <>
                  <button className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                    Login
                  </button>
                  <Button variant="primary" className="px-3 sm:px-4 py-1.5 text-xs">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Input - Shows when search icon is clicked */}
      {showMobileSearch && (
        <div className="lg:hidden px-3 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm transition"
              autoFocus
            />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 pb-20 lg:pb-4 sm:pb-5">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <MarketCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <MarketGrid markets={filteredMarkets} />
        )}

        {filteredMarkets.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-xs sm:text-sm">No markets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionMarket;

