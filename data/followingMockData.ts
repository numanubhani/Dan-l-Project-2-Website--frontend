/** Relation shown on the Follow CTA — maps cleanly to future API. */
export type FollowRelation = 'follow' | 'following' | 'requested' | 'mutual';

export interface FollowingCreator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  verified: boolean;
  followersCount: number;
  category: string;
  bio: string;
  location?: string;
  engagementScore: number;
  isSuggested: boolean;
  isLive?: boolean;
  /** Seed state for UI before local toggles */
  initialRelation: FollowRelation;
}

const cover = (seed: number, w = 480, h = 640) =>
  `https://picsum.photos/seed/fc${seed}/${w}/${h}`;
const av = (seed: number) => `https://picsum.photos/seed/fa${seed}/96/96`;

export const MOCK_CREATORS: FollowingCreator[] = [
  {
    id: '1',
    name: 'Nova Chen',
    username: 'novachen',
    avatar: av(101),
    coverImage: cover(201),
    verified: true,
    followersCount: 2_400_000,
    category: 'Music',
    bio: 'Producer · live sets every Friday',
    location: 'Seoul',
    engagementScore: 98,
    isSuggested: false,
    isLive: true,
    initialRelation: 'following',
  },
  {
    id: '2',
    name: 'Jax Rivera',
    username: 'jaxplays',
    avatar: av(102),
    coverImage: cover(202),
    verified: true,
    followersCount: 890_000,
    category: 'Gaming',
    bio: 'Speedruns & chill commentary',
    location: 'Austin',
    engagementScore: 91,
    isSuggested: false,
    initialRelation: 'mutual',
  },
  {
    id: '3',
    name: 'Mira Okonkwo',
    username: 'miraok',
    avatar: av(103),
    coverImage: cover(203),
    verified: false,
    followersCount: 120_000,
    category: 'Comedy',
    bio: 'Sketches that hit a little too close',
    engagementScore: 87,
    isSuggested: true,
    initialRelation: 'follow',
  },
  {
    id: '4',
    name: 'Theo Park',
    username: 'theopark',
    avatar: av(104),
    coverImage: cover(204),
    verified: true,
    followersCount: 5_100_000,
    category: 'Lifestyle',
    bio: 'Day-in-the-life from a tiny apartment',
    location: 'London',
    engagementScore: 95,
    isSuggested: false,
    initialRelation: 'following',
  },
  {
    id: '5',
    name: 'Riley Kim',
    username: 'rileyk',
    avatar: av(105),
    coverImage: cover(205),
    verified: false,
    followersCount: 45_000,
    category: 'Art',
    bio: 'Digital paint streams · commissions closed',
    engagementScore: 72,
    isSuggested: true,
    initialRelation: 'requested',
  },
  {
    id: '6',
    name: 'Diego Alvarez',
    username: 'diegoalv',
    avatar: av(106),
    coverImage: cover(206),
    verified: true,
    followersCount: 1_200_000,
    category: 'Sports',
    bio: 'Training breakdowns & match reactions',
    location: 'Madrid',
    engagementScore: 93,
    isSuggested: false,
    initialRelation: 'following',
  },
  {
    id: '7',
    name: 'Aisha Bello',
    username: 'aishabello',
    avatar: av(107),
    coverImage: cover(207),
    verified: false,
    followersCount: 210_000,
    category: 'Fashion',
    bio: 'Outfits under $50 · thrift first',
    engagementScore: 84,
    isSuggested: true,
    initialRelation: 'follow',
  },
  {
    id: '8',
    name: 'Leo Hart',
    username: 'leohart',
    avatar: av(108),
    coverImage: cover(208),
    verified: true,
    followersCount: 3_400_000,
    category: 'Technology',
    bio: 'Gadgets that actually earn their shelf space',
    engagementScore: 96,
    isSuggested: false,
    initialRelation: 'following',
  },
  {
    id: '9',
    name: 'Zara Malik',
    username: 'zaram',
    avatar: av(109),
    coverImage: cover(209),
    verified: false,
    followersCount: 78_000,
    category: 'Food',
    bio: 'Street food tours · spice tolerance: high',
    location: 'Dubai',
    engagementScore: 79,
    isSuggested: true,
    initialRelation: 'follow',
  },
  {
    id: '10',
    name: 'Chris Vance',
    username: 'chrisvance',
    avatar: av(110),
    coverImage: cover(210),
    verified: true,
    followersCount: 670_000,
    category: 'Music',
    bio: 'Lo-fi sets & vocal layers',
    engagementScore: 88,
    isSuggested: false,
    initialRelation: 'following',
  },
  {
    id: '11',
    name: 'Elena Frost',
    username: 'elenafrost',
    avatar: av(111),
    coverImage: cover(211),
    verified: false,
    followersCount: 33_000,
    category: 'Education',
    bio: '5-minute explainers · no jargon',
    engagementScore: 81,
    isSuggested: true,
    initialRelation: 'follow',
  },
  {
    id: '12',
    name: 'Marcus Webb',
    username: 'marcuswebb',
    avatar: av(112),
    coverImage: cover(212),
    verified: true,
    followersCount: 980_000,
    category: 'Gaming',
    bio: 'Esports analysis & patch notes',
    engagementScore: 90,
    isSuggested: false,
    initialRelation: 'mutual',
  },
];

/** Creators the signed-in user follows — replace with `GET /following` (or similar) later. */
export const FOLLOWING_FEED_CREATORS: FollowingCreator[] = MOCK_CREATORS.filter(
  c =>
    c.initialRelation === 'following' ||
    c.initialRelation === 'mutual' ||
    c.initialRelation === 'requested',
);

export const CREATOR_CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'Comedy',
  'Lifestyle',
  'Art',
  'Sports',
  'Fashion',
  'Technology',
  'Food',
  'Education',
] as const;

export type SortKey = 'popular' | 'recent' | 'suggested' | 'following';
