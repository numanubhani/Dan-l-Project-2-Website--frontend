import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FOLLOWING_FEED_CREATORS,
  FollowingCreator,
  FollowRelation,
} from '../data/followingMockData';
import { User } from '../types';

export interface FollowingPageProps {
  user?: User | null;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const formatFollowers = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const GRID_CLASS =
  'grid w-full min-w-0 grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4';

const THUMB_ASPECT = 'aspect-[3/4]';

/* ─── FollowButton ───────────────────────────────────────────────────────── */

interface FollowButtonProps {
  relation: FollowRelation;
  onChange: (next: FollowRelation) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ relation, onChange }) => {
  const cycle = (current: FollowRelation): FollowRelation => {
    if (current === 'follow' || current === 'requested') return 'following';
    if (current === 'following') return 'follow';
    if (current === 'mutual') return 'follow';
    return 'following';
  };

  const label =
    relation === 'follow'
      ? 'Follow'
      : relation === 'following'
        ? 'Following'
        : relation === 'requested'
          ? 'Requested'
          : 'Friends';

  const base =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] active:scale-[0.98] sm:text-[13px]';

  if (relation === 'follow') {
    return (
      <button
        type="button"
        aria-pressed="false"
        className={`${base} bg-[#FE2C55] text-white shadow-md shadow-[#FE2C55]/20 hover:bg-[#e6254b]`}
        onClick={e => {
          e.stopPropagation();
          onChange('following');
        }}
      >
        {label}
      </button>
    );
  }

  if (relation === 'requested') {
    return (
      <button
        type="button"
        aria-pressed="true"
        title="Request pending"
        className={`${base} border border-amber-400/60 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25`}
        onClick={e => {
          e.stopPropagation();
          onChange('follow');
        }}
      >
        {label}
      </button>
    );
  }

  if (relation === 'mutual') {
    return (
      <button
        type="button"
        aria-pressed="true"
        title="You follow each other"
        className={`${base} border border-emerald-400/50 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25`}
        onClick={e => {
          e.stopPropagation();
          onChange(cycle(relation));
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed="true"
      className={`${base} border border-white/25 bg-white/[0.08] text-white hover:bg-white/[0.14]`}
      onClick={e => {
        e.stopPropagation();
        onChange(cycle(relation));
      }}
    >
      {label}
    </button>
  );
};

/* ─── CreatorCard ───────────────────────────────────────────────────────── */

interface CreatorCardProps {
  creator: FollowingCreator;
  relation: FollowRelation;
  onRelationChange: (id: string, next: FollowRelation) => void;
  onOpenProfile: () => void;
}

const VerifiedIcon = () => (
  <svg className="h-3.5 w-3.5 shrink-0 text-[#20d5ec]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  relation,
  onRelationChange,
  onOpenProfile,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article className="group flex min-w-0 flex-col">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenProfile()}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenProfile();
          }
        }}
        className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141414] transition-all duration-300 hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] sm:hover:-translate-y-0.5"
        aria-label={`Open profile ${creator.name}`}
      >
        <div className={`relative w-full shrink-0 overflow-hidden ${THUMB_ASPECT}`}>
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-[#1e1e1e]" />}
          <img
            src={creator.coverImage}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

          {creator.isLive && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center px-3 pb-3 pt-8 text-center">
            <img
              src={creator.avatar}
              alt=""
              className="mb-2 h-14 w-14 rounded-full border-2 border-white/30 object-cover ring-2 ring-black/40"
            />
            <div className="flex w-full min-w-0 items-center justify-center gap-1">
              <h3 className="truncate text-sm font-bold text-white sm:text-[15px]">{creator.name}</h3>
              {creator.verified && (
                <span title="Verified creator">
                  <VerifiedIcon />
                </span>
              )}
            </div>
            <p className="mt-0.5 w-full truncate text-[11px] text-white/55">@{creator.username}</p>
            <p className="mt-1 line-clamp-1 min-h-[1rem] text-[10px] text-white/40">{creator.bio}</p>
            <div className="mt-3 w-full">
              <FollowButton
                relation={relation}
                onChange={next => onRelationChange(creator.id, next)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2 text-[10px] text-white/45">
          <span>{formatFollowers(creator.followersCount)} followers</span>
          {creator.location && <span className="truncate pl-2">{creator.location}</span>}
        </div>
      </div>
    </article>
  );
};

/* ─── Page ──────────────────────────────────────────────────────────────── */

const FollowingPage: React.FC<FollowingPageProps> = () => {
  const navigate = useNavigate();

  const [relations, setRelations] = useState<Record<string, FollowRelation>>(() => {
    const m: Record<string, FollowRelation> = {};
    FOLLOWING_FEED_CREATORS.forEach(c => {
      m[c.id] = c.initialRelation;
    });
    return m;
  });

  const handleRelationChange = useCallback((id: string, next: FollowRelation) => {
    setRelations(prev => ({ ...prev, [id]: next }));
  }, []);

  const handleOpenProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const creators = FOLLOWING_FEED_CREATORS;

  return (
    <div className="isolate flex min-h-full w-full min-w-0 max-w-full flex-col overflow-x-hidden bg-[#121212]">
      <div className="mx-auto w-full max-w-[1600px] min-w-0 px-4 pt-4 pb-24 sm:px-5 sm:pt-5 lg:px-6 lg:pb-10 lg:pt-6">
        {creators.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/45">No creators to show yet.</p>
        ) : (
          <div className={GRID_CLASS}>
            {creators.map(c => (
              <CreatorCard
                key={c.id}
                creator={c}
                relation={relations[c.id] ?? c.initialRelation}
                onRelationChange={handleRelationChange}
                onOpenProfile={handleOpenProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingPage;
