import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPLORE_CATEGORIES, ExploreCategory } from '../data/exploreCategories';
import { MOCK_POSTS, ExplorePost } from '../data/exploreMockData';
import { User } from '../types';

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface ExplorePageProps {
  user?: User | null;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

/** Single thumbnail ratio for every card — stable grid rows, no masonry. */
const THUMB_ASPECT = 'aspect-[3/4]';

/** Explicit grid: 2 → 3 → 4 → 5 → 6 columns (no auto-fit, no columns layout). */
const EXPLORE_GRID_CLASS =
  'grid w-full min-w-0 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5';

/* ─── Icons ──────────────────────────────────────────────────────────────── */

const HeartIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const EyeIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const VerifiedBadge = () => (
  <svg className="w-3 h-3 text-neon-cyan shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

const VideoIcon = () => (
  <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

/* ─── ExploreCard ────────────────────────────────────────────────────────── */

const ExploreCard: React.FC<{ post: ExplorePost }> = ({ post }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group flex min-w-0 cursor-pointer flex-col">
      <div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-neon-surface transition-all duration-200 hover:border-neon-violet/25 hover:shadow-card-hover sm:rounded-2xl">

        {/* Thumbnail — fixed aspect, fills cell width */}
        <div className={`relative w-full shrink-0 overflow-hidden ${THUMB_ASPECT}`}>

          {/* Skeleton shimmer while image loads */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-neon-ink animate-pulse" />
          )}

          {/* Error fallback */}
          {imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-neon-panel to-neon-elevated flex items-center justify-center">
              <VideoIcon />
            </div>
          )}

          {/* Image */}
          {!imgError && (
            <img
              src={post.thumbnail}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgLoaded(true); setImgError(true); }}
            />
          )}

          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/[0.12] to-transparent pointer-events-none" />

          {/* Trending badge — top left */}
          {post.trending && (
            <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-neon-pink text-white text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wide uppercase">
              🔥 Hot
            </div>
          )}

          {/* Duration badge — top right */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-[3px] rounded-md leading-none">
            {post.duration}
          </div>

          {/* Play icon overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>

          {/* Stats — bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-white text-[10px] sm:text-[11px] font-semibold drop-shadow">
              <HeartIcon />{formatCount(post.likes)}
            </span>
            <span className="flex items-center gap-1 text-white/80 text-[10px] sm:text-[11px] font-medium drop-shadow">
              <EyeIcon />{formatCount(post.views)}
            </span>
            {post.location && (
              <span className="ml-auto text-white/60 text-[9px] font-medium truncate max-w-[60px] drop-shadow">
                📍{post.location}
              </span>
            )}
          </div>
        </div>

        {/* Meta — fixed vertical rhythm: 1-line user, 2-line caption, 1-line tags */}
        <div className="flex shrink-0 flex-col gap-1 px-2.5 pb-2.5 pt-2">
          <div className="flex min-h-[1.25rem] items-center gap-1.5">
            <img
              src={post.creatorAvatar}
              alt=""
              loading="lazy"
              className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/10"
            />
            <span className="min-w-0 flex-1 text-[11px] font-bold leading-tight text-white/90 sm:text-[12px]">
              <span className="line-clamp-1">@{post.creatorName}</span>
            </span>
            {post.verified && <VerifiedBadge />}
          </div>

          <p className="line-clamp-2 min-h-[2.625rem] text-[10px] leading-snug text-white/50 sm:text-[11px]">
            {post.caption}
          </p>

          <p className="line-clamp-1 min-h-[0.875rem] text-[10px] font-medium leading-tight text-neon-pink/75">
            {post.hashtags.length > 0 ? post.hashtags.slice(0, 2).join(' ') : '\u00a0'}
          </p>
        </div>
      </div>
    </article>
  );
};

/* ─── SkeletonCard ───────────────────────────────────────────────────────── */

const SkeletonCard: React.FC = () => (
  <div className="flex min-w-0 flex-col">
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-neon-surface sm:rounded-2xl">
      <div className={`${THUMB_ASPECT} w-full shrink-0 bg-neon-ink animate-pulse`} />
      <div className="flex shrink-0 flex-col gap-1 px-2.5 pb-2.5 pt-2">
        <div className="flex min-h-[1.25rem] items-center gap-1.5">
          <div className="h-5 w-5 shrink-0 rounded-full bg-white/[0.08] animate-pulse" />
          <div className="h-2.5 min-w-0 flex-1 max-w-[70%] rounded-full bg-white/[0.08] animate-pulse" />
        </div>
        <div className="min-h-[2.625rem] space-y-1.5 pt-0.5">
          <div className="h-2 w-full rounded-full bg-white/[0.06] animate-pulse" />
          <div className="h-2 w-[80%] rounded-full bg-white/[0.06] animate-pulse" />
        </div>
        <div className="h-2 w-1/2 rounded-full bg-white/[0.06] animate-pulse" />
      </div>
    </div>
  </div>
);

/* ─── EmptyState ─────────────────────────────────────────────────────────── */

const EmptyState: React.FC<{ query: string; category: string; onClear: () => void }> = ({
  query, category, onClear,
}) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
    <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
      <svg className="w-9 h-9 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <h3 className="text-[17px] font-bold text-white mb-2">No results found</h3>
    <p className="text-[13px] text-white/40 max-w-xs leading-relaxed mb-6">
      {query
        ? `Nothing matched "${query}"${category !== 'all' ? ` in ${category}` : ''}. Try a different keyword.`
        : `No content in this category yet. Check back soon.`
      }
    </p>
    <button
      onClick={onClear}
      className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-[13px] font-semibold transition-colors"
    >
      Clear filters
    </button>
  </div>
);

/* ─── ExploreGrid ────────────────────────────────────────────────────────── */

interface ExploreGridProps {
  posts: ExplorePost[];
  loading: boolean;
  searchQuery: string;
  activeCategory: string;
  onClearFilters: () => void;
}

const ExploreGrid: React.FC<ExploreGridProps> = ({
  posts, loading, searchQuery, activeCategory, onClearFilters,
}) => {
  if (loading) {
    return (
      <div className={EXPLORE_GRID_CLASS}>
        {Array.from({ length: 18 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState query={searchQuery} category={activeCategory} onClear={onClearFilters} />
    );
  }

  return (
    <div className={EXPLORE_GRID_CLASS}>
      {posts.map(post => (
        <ExploreCard key={post.id} post={post} />
      ))}
    </div>
  );
};

/* ─── CategoryTabs ───────────────────────────────────────────────────────── */

interface CategoryTabsProps {
  categories: ExploreCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeId, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Auto-scroll active tab into view
  useEffect(() => {
    const btn = btnRefs.current[activeId];
    if (btn && scrollRef.current) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeId]);

  return (
    <div className="relative min-w-0 w-full">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide px-3 sm:px-4 py-2 min-w-0"
      >
        {categories.map(cat => {
          const active = cat.id === activeId;
          return (
            <button
              key={cat.id}
              ref={el => { btnRefs.current[cat.id] = el; }}
              onClick={() => onSelect(cat.id)}
              aria-pressed={active}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink focus-visible:ring-offset-2 focus-visible:ring-offset-neon-base ${
                active
                  ? 'bg-gradient-to-r from-neon-violet/92 to-neon-pink/88 text-white shadow-md shadow-neon-pink/35'
                  : 'bg-white/[0.07] text-white/65 hover:bg-white/[0.13] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
      {/* Right-edge fade affordance */}
      <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-neon-base to-transparent pointer-events-none" aria-hidden />
      <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-neon-base to-transparent pointer-events-none" aria-hidden />
    </div>
  );
};

/* ─── ExploreTopBar ──────────────────────────────────────────────────────── */

interface ExploreTopBarProps {
  categories: ExploreCategory[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user: User | null | undefined;
  onNavigate: (path: string) => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ExploreTopBar: React.FC<ExploreTopBarProps> = ({
  categories, activeCategory, onCategoryChange,
  searchQuery, onSearchChange, user, onNavigate,
  sidebarOpen = true, onToggleSidebar,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="sticky top-0 z-10 shrink-0 bg-neon-base/92 backdrop-blur-md border-b border-white/[0.06] shadow-neon-line">
      {/* Toolbar: lives only in main content — no app-level logo (sidebar owns VPULSE) */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 min-h-[3.5rem] min-w-0">

        {searchOpen ? (
          <>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.13] text-white/70 hover:text-white transition shrink-0"
            >
              <BackIcon />
            </button>

            <div className="flex-1 min-w-0 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search creators, captions, tags…"
                aria-label="Search explore content"
                className="w-full min-w-0 bg-white/[0.08] border border-white/[0.08] text-white text-[13px] pl-9 pr-9 py-2 rounded-full placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.1] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-white/40 hover:text-white transition"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Desktop: reopen sidebar when collapsed — aligns content with shell */}
            {!sidebarOpen && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden lg:flex p-2 rounded-lg hover:bg-white/[0.08] text-white/80 transition shrink-0"
                aria-label="Open navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-[15px] sm:text-base font-bold text-white/95 tracking-tight truncate">
                Discover
              </span>
              <span className="hidden sm:inline text-[11px] text-white/35 font-medium truncate">
                Find clips by topic
              </span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Open search"
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition"
              >
                <SearchIcon />
              </button>

              <button
                type="button"
                aria-label="Notifications"
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition"
              >
                <BellIcon />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/upload')}
                aria-label="Upload video"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition"
              >
                <UploadIcon />
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={() => onNavigate('/profile')}
                  aria-label="Go to profile"
                  className="w-8 h-8 ml-1 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-neon-pink/60 transition-all shrink-0"
                >
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="ml-1 px-3 py-1.5 rounded-full bg-neon-pink hover:bg-neon-pink-hover text-white text-[11px] sm:text-[12px] font-bold transition shrink-0"
                >
                  Log in
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <CategoryTabs
        categories={categories}
        activeId={activeCategory}
        onSelect={onCategoryChange}
      />
    </div>
  );
};

/* ─── ExplorePage (default export) ──────────────────────────────────────── */

const ExplorePage: React.FC<ExplorePageProps> = ({
  user,
  onToggleSidebar,
  sidebarOpen = true,
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate initial data fetch
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // Combined filter: category AND search query
  const filteredPosts = useMemo(() => {
    let posts = MOCK_POSTS;

    if (activeCategory !== 'all') {
      posts = posts.filter(p => p.category === activeCategory);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      posts = posts.filter(p =>
        p.caption.toLowerCase().includes(q) ||
        p.creatorName.toLowerCase().includes(q) ||
        p.hashtags.some(h => h.toLowerCase().includes(q))
      );
    }

    return posts;
  }, [activeCategory, searchQuery]);

  const handleClearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
  };

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    // Brief shimmer when switching categories
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <div className="flex flex-col min-h-full w-full min-w-0 max-w-full box-border overflow-x-hidden bg-neon-base isolate">
      <ExploreTopBar
        categories={EXPLORE_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        onNavigate={navigate}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="flex-1 min-w-0 w-full px-3 sm:px-4 lg:px-5 py-3 pb-20 lg:pb-6">
        <ExploreGrid
          posts={filteredPosts}
          loading={loading}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onClearFilters={handleClearFilters}
        />
      </div>
    </div>
  );
};

export default ExplorePage;
