export type AspectRatio = 'tall' | 'portrait' | 'square';

export interface ExplorePost {
  id: string;
  thumbnail: string;
  creatorName: string;
  creatorAvatar: string;
  caption: string;
  hashtags: string[];
  likes: number;
  views: number;
  category: string;
  verified: boolean;
  duration: string;
  trending: boolean;
  location?: string;
  aspectRatio: AspectRatio;
}

/** Returns a deterministic picsum image URL */
const img = (seed: number, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const av = (seed: number) => img(seed, 80, 80);

// ─── Mock posts ───────────────────────────────────────────────────────────────
// 3 posts per category × 13 categories = 39 posts
// Aspect ratios cycle: tall → portrait → square → tall → …

export const MOCK_POSTS: ExplorePost[] = [
  // ── Singing & Dancing ───────────────────────────────────────────────────────
  {
    id: 'sd1', category: 'singing-dancing', aspectRatio: 'tall',
    thumbnail: img(11, 360, 640), creatorAvatar: av(201), creatorName: 'stardancer',
    caption: 'Night vibes only — lost in the rhythm 🌙✨',
    hashtags: ['#dance', '#nightvibes', '#rhythm'],
    likes: 142300, views: 2800000, verified: true, duration: '0:32', trending: true,
  },
  {
    id: 'sd2', category: 'singing-dancing', aspectRatio: 'portrait',
    thumbnail: img(22, 360, 450), creatorAvatar: av(202), creatorName: 'groovemaster',
    caption: 'That transition tho 🔥 Drop the beat and let your body speak',
    hashtags: ['#grooves', '#transition', '#hiphop'],
    likes: 89500, views: 1400000, verified: false, duration: '0:58', trending: false,
  },
  {
    id: 'sd3', category: 'singing-dancing', aspectRatio: 'square',
    thumbnail: img(33, 400, 400), creatorAvatar: av(203), creatorName: 'rhythmqueen',
    caption: 'POV: you finally nail the choreography after 100 attempts 😅🎵',
    hashtags: ['#choreo', '#dance', '#fyp'],
    likes: 304000, views: 5100000, verified: true, duration: '1:02', trending: true,
    location: 'Los Angeles',
  },

  // ── Comedy ──────────────────────────────────────────────────────────────────
  {
    id: 'co1', category: 'comedy', aspectRatio: 'tall',
    thumbnail: img(44, 360, 640), creatorAvatar: av(204), creatorName: 'funnyframes',
    caption: 'Me trying to explain to my boss why I need Fridays off forever 😂',
    hashtags: ['#comedy', '#relatable', '#work'],
    likes: 512000, views: 8200000, verified: true, duration: '0:45', trending: true,
  },
  {
    id: 'co2', category: 'comedy', aspectRatio: 'portrait',
    thumbnail: img(55, 360, 450), creatorAvatar: av(205), creatorName: 'laughtrack',
    caption: 'Trying a new recipe my mom sent — it went exactly as expected 💀',
    hashtags: ['#cooking', '#fail', '#funny'],
    likes: 231000, views: 3700000, verified: false, duration: '0:39', trending: false,
  },
  {
    id: 'co3', category: 'comedy', aspectRatio: 'square',
    thumbnail: img(66, 400, 400), creatorAvatar: av(206), creatorName: 'comedyking',
    caption: 'When the Uber arrives but you still have shoes to find 🚗👟',
    hashtags: ['#uber', '#lateagain', '#comedy'],
    likes: 98700, views: 1900000, verified: false, duration: '0:22', trending: false,
  },

  // ── Sports ──────────────────────────────────────────────────────────────────
  {
    id: 'sp1', category: 'sports', aspectRatio: 'tall',
    thumbnail: img(77, 360, 640), creatorAvatar: av(207), creatorName: 'swishking',
    caption: '5AM grind never stops. The court is my therapy 🏀🔥',
    hashtags: ['#basketball', '#grind', '#sports'],
    likes: 178000, views: 3200000, verified: true, duration: '1:15', trending: false,
    location: 'Chicago',
  },
  {
    id: 'sp2', category: 'sports', aspectRatio: 'portrait',
    thumbnail: img(88, 360, 450), creatorAvatar: av(208), creatorName: 'rungirl',
    caption: 'Half marathon done. PR smashed. Legs destroyed. Worth it ✅🏃‍♀️',
    hashtags: ['#running', '#marathon', '#fitness'],
    likes: 64200, views: 920000, verified: false, duration: '0:48', trending: false,
  },
  {
    id: 'sp3', category: 'sports', aspectRatio: 'square',
    thumbnail: img(99, 400, 400), creatorAvatar: av(209), creatorName: 'powerlift',
    caption: '315 lbs deadlift — new milestone unlocked 💪 Consistency is king',
    hashtags: ['#powerlifting', '#gym', '#strong'],
    likes: 245000, views: 4800000, verified: true, duration: '0:28', trending: true,
  },

  // ── Anime & Comics ──────────────────────────────────────────────────────────
  {
    id: 'an1', category: 'anime', aspectRatio: 'tall',
    thumbnail: img(110, 360, 640), creatorAvatar: av(210), creatorName: 'animehaven',
    caption: 'The way this arc hit different at 2AM 😭 I was NOT okay',
    hashtags: ['#anime', '#emotional', '#spoilers'],
    likes: 387000, views: 6700000, verified: true, duration: '0:55', trending: true,
  },
  {
    id: 'an2', category: 'anime', aspectRatio: 'portrait',
    thumbnail: img(121, 360, 450), creatorAvatar: av(211), creatorName: 'mangamaster',
    caption: 'Manga panel recreation with my art tablet — 40 hours of work 🎨',
    hashtags: ['#manga', '#art', '#digitalart'],
    likes: 129000, views: 2100000, verified: false, duration: '1:30', trending: false,
  },
  {
    id: 'an3', category: 'anime', aspectRatio: 'square',
    thumbnail: img(132, 400, 400), creatorAvatar: av(212), creatorName: 'cosplaypro',
    caption: 'Spent 3 months on this cosplay and I have zero regrets ⚔️✨',
    hashtags: ['#cosplay', '#anime', '#handmade'],
    likes: 492000, views: 9100000, verified: true, duration: '0:42', trending: true,
    location: 'Tokyo',
  },

  // ── Relationships ────────────────────────────────────────────────────────────
  {
    id: 'rl1', category: 'relationships', aspectRatio: 'tall',
    thumbnail: img(143, 360, 640), creatorAvatar: av(213), creatorName: 'couplediary',
    caption: 'Recreating our first date photo 4 years later 🥹❤️',
    hashtags: ['#couple', '#anniversary', '#love'],
    likes: 621000, views: 11200000, verified: true, duration: '0:38', trending: true,
  },
  {
    id: 'rl2', category: 'relationships', aspectRatio: 'portrait',
    thumbnail: img(154, 360, 450), creatorAvatar: av(214), creatorName: 'heartbeats',
    caption: 'What dating looks like after 5 years together — real and raw 💬',
    hashtags: ['#realrelationship', '#couplelife', '#honest'],
    likes: 183000, views: 3400000, verified: false, duration: '1:05', trending: false,
  },
  {
    id: 'rl3', category: 'relationships', aspectRatio: 'square',
    thumbnail: img(165, 400, 400), creatorAvatar: av(215), creatorName: 'romanticvibes',
    caption: 'He didn\'t plan this but somehow made it perfect 🌹 I cried',
    hashtags: ['#surprise', '#romance', '#proposal'],
    likes: 834000, views: 14600000, verified: true, duration: '0:52', trending: true,
  },

  // ── Shows ────────────────────────────────────────────────────────────────────
  {
    id: 'sh1', category: 'shows', aspectRatio: 'tall',
    thumbnail: img(176, 360, 640), creatorAvatar: av(216), creatorName: 'cinebuff',
    caption: 'The ending of this episode broke me — I had to rewatch 6 times 📺',
    hashtags: ['#tvshow', '#mindblown', '#review'],
    likes: 278000, views: 5200000, verified: false, duration: '1:20', trending: true,
  },
  {
    id: 'sh2', category: 'shows', aspectRatio: 'portrait',
    thumbnail: img(187, 360, 450), creatorAvatar: av(217), creatorName: 'showstopper',
    caption: 'Top 5 shows I cannot stop recommending to everyone I meet 🔥',
    hashtags: ['#watchlist', '#binge', '#recommendations'],
    likes: 145000, views: 2700000, verified: true, duration: '2:00', trending: false,
  },
  {
    id: 'sh3', category: 'shows', aspectRatio: 'square',
    thumbnail: img(198, 400, 400), creatorAvatar: av(218), creatorName: 'serialwatcher',
    caption: 'Plot twist of the century — nobody saw THIS coming 😱',
    hashtags: ['#plottwist', '#omg', '#tvdrama'],
    likes: 412000, views: 7800000, verified: true, duration: '0:34', trending: true,
  },

  // ── Lipsync ──────────────────────────────────────────────────────────────────
  {
    id: 'ls1', category: 'lipsync', aspectRatio: 'tall',
    thumbnail: img(209, 360, 640), creatorAvatar: av(219), creatorName: 'lipsyncpro',
    caption: 'This song lives rent-free in my head — I had to do it 🎤',
    hashtags: ['#lipsync', '#music', '#viral'],
    likes: 367000, views: 6100000, verified: false, duration: '0:29', trending: true,
  },
  {
    id: 'ls2', category: 'lipsync', aspectRatio: 'portrait',
    thumbnail: img(220, 360, 450), creatorAvatar: av(220), creatorName: 'lipmaster',
    caption: 'Duet me — let\'s see if anyone can keep up with this 😤💃',
    hashtags: ['#duet', '#challenge', '#lipsync'],
    likes: 92400, views: 1800000, verified: false, duration: '0:22', trending: false,
  },
  {
    id: 'ls3', category: 'lipsync', aspectRatio: 'square',
    thumbnail: img(231, 400, 400), creatorAvatar: av(221), creatorName: 'syncqueen',
    caption: 'That dramatic movie monologue we all memorised in high school 🎭',
    hashtags: ['#dramatic', '#iconic', '#lipsync'],
    likes: 208000, views: 4000000, verified: true, duration: '0:47', trending: false,
  },

  // ── Daily Life ───────────────────────────────────────────────────────────────
  {
    id: 'dl1', category: 'daily-life', aspectRatio: 'tall',
    thumbnail: img(242, 360, 640), creatorAvatar: av(222), creatorName: 'dayvlog',
    caption: 'Day in my life as a freelance designer — 6AM to midnight ☕💻',
    hashtags: ['#dayinmylife', '#freelance', '#vlog'],
    likes: 156000, views: 2900000, verified: true, duration: '3:45', trending: false,
  },
  {
    id: 'dl2', category: 'daily-life', aspectRatio: 'portrait',
    thumbnail: img(253, 360, 450), creatorAvatar: av(223), creatorName: 'lifemoments',
    caption: 'Morning routine that actually changed my entire year 🌅',
    hashtags: ['#morning', '#routine', '#productivity'],
    likes: 423000, views: 7600000, verified: false, duration: '2:10', trending: true,
  },
  {
    id: 'dl3', category: 'daily-life', aspectRatio: 'square',
    thumbnail: img(264, 400, 400), creatorAvatar: av(224), creatorName: 'reallife',
    caption: 'Moved to a new city alone — week one was chaos and I loved it 🌆',
    hashtags: ['#newcity', '#adultlife', '#solo'],
    likes: 289000, views: 5300000, verified: false, duration: '1:55', trending: false,
    location: 'New York',
  },

  // ── Beauty Care ──────────────────────────────────────────────────────────────
  {
    id: 'bc1', category: 'beauty', aspectRatio: 'tall',
    thumbnail: img(275, 360, 640), creatorAvatar: av(225), creatorName: 'glowup',
    caption: 'The 3-step routine that cleared my skin in 30 days — no filter 🧴✨',
    hashtags: ['#skincare', '#glowup', '#nofilter'],
    likes: 784000, views: 13400000, verified: true, duration: '1:12', trending: true,
  },
  {
    id: 'bc2', category: 'beauty', aspectRatio: 'portrait',
    thumbnail: img(286, 360, 450), creatorAvatar: av(226), creatorName: 'beautyblend',
    caption: 'That gradient eyeshadow technique nobody taught me — until now 👁️',
    hashtags: ['#eyeshadow', '#makeup', '#tutorial'],
    likes: 342000, views: 6200000, verified: true, duration: '2:30', trending: false,
  },
  {
    id: 'bc3', category: 'beauty', aspectRatio: 'square',
    thumbnail: img(297, 400, 400), creatorAvatar: av(227), creatorName: 'skincareguru',
    caption: 'I tested 12 viral sunscreens. Here\'s the honest ranking ☀️',
    hashtags: ['#sunscreen', '#review', '#skincare'],
    likes: 197000, views: 3700000, verified: false, duration: '1:50', trending: false,
  },

  // ── Fashion ──────────────────────────────────────────────────────────────────
  {
    id: 'fa1', category: 'fashion', aspectRatio: 'tall',
    thumbnail: img(308, 360, 640), creatorAvatar: av(228), creatorName: 'styleicon',
    caption: 'Thrift store haul → styled 5 complete outfits under $40 🧥💰',
    hashtags: ['#thrift', '#ootd', '#fashion'],
    likes: 456000, views: 8900000, verified: true, duration: '1:35', trending: true,
  },
  {
    id: 'fa2', category: 'fashion', aspectRatio: 'portrait',
    thumbnail: img(319, 360, 450), creatorAvatar: av(229), creatorName: 'fashionweek',
    caption: 'Street style shots that prove fashion is for everyone 📸',
    hashtags: ['#streetstyle', '#inclusivefashion', '#style'],
    likes: 212000, views: 4100000, verified: false, duration: '0:50', trending: false,
    location: 'Milan',
  },
  {
    id: 'fa3', category: 'fashion', aspectRatio: 'square',
    thumbnail: img(330, 400, 400), creatorAvatar: av(230), creatorName: 'ootdqueen',
    caption: 'Dressing for yourself > dressing for the algorithm 👑',
    hashtags: ['#ootd', '#selfexpression', '#fashion'],
    likes: 567000, views: 10200000, verified: true, duration: '0:38', trending: true,
  },

  // ── Food ─────────────────────────────────────────────────────────────────────
  {
    id: 'fd1', category: 'food', aspectRatio: 'tall',
    thumbnail: img(341, 360, 640), creatorAvatar: av(231), creatorName: 'foodcrafter',
    caption: 'My nonna\'s secret pasta recipe — 60 years and finally written down 🍝',
    hashtags: ['#pasta', '#italian', '#recipe'],
    likes: 892000, views: 16700000, verified: true, duration: '2:15', trending: true,
  },
  {
    id: 'fd2', category: 'food', aspectRatio: 'portrait',
    thumbnail: img(352, 360, 450), creatorAvatar: av(232), creatorName: 'tastechaser',
    caption: 'Street food tour through 10 cities in 10 days 🌍🍜',
    hashtags: ['#streetfood', '#foodtravel', '#mukbang'],
    likes: 318000, views: 5900000, verified: false, duration: '3:10', trending: false,
  },
  {
    id: 'fd3', category: 'food', aspectRatio: 'square',
    thumbnail: img(363, 400, 400), creatorAvatar: av(233), creatorName: 'recipepro',
    caption: '5-ingredient meals that taste like you spent all day cooking 🔥',
    hashtags: ['#easyrecipe', '#cooking', '#mealprep'],
    likes: 674000, views: 12300000, verified: true, duration: '1:45', trending: true,
  },

  // ── Technology ───────────────────────────────────────────────────────────────
  {
    id: 'tc1', category: 'technology', aspectRatio: 'tall',
    thumbnail: img(374, 360, 640), creatorAvatar: av(234), creatorName: 'devworld',
    caption: 'I built a full SaaS product in one weekend — here\'s every tool I used 🛠️',
    hashtags: ['#buildinpublic', '#saas', '#coding'],
    likes: 241000, views: 4400000, verified: true, duration: '2:45', trending: false,
  },
  {
    id: 'tc2', category: 'technology', aspectRatio: 'portrait',
    thumbnail: img(385, 360, 450), creatorAvatar: av(235), creatorName: 'techgeek',
    caption: 'AI tools that replaced half my weekly workflow — I\'m not mad 🤖',
    hashtags: ['#ai', '#productivity', '#tech'],
    likes: 503000, views: 9600000, verified: false, duration: '1:20', trending: true,
  },
  {
    id: 'tc3', category: 'technology', aspectRatio: 'square',
    thumbnail: img(396, 400, 400), creatorAvatar: av(236), creatorName: 'aibuilder',
    caption: 'Setup tour: my $3K dev workspace that makes me 4x faster ⚡💻',
    hashtags: ['#battlestation', '#setup', '#developer'],
    likes: 187000, views: 3500000, verified: true, duration: '3:00', trending: false,
    location: 'San Francisco',
  },

  // ── Gaming ───────────────────────────────────────────────────────────────────
  {
    id: 'gm1', category: 'gaming', aspectRatio: 'tall',
    thumbnail: img(407, 360, 640), creatorAvatar: av(237), creatorName: 'gamerzone',
    caption: 'The 1v5 clutch nobody in my squad believed would happen 🎮🔥',
    hashtags: ['#gaming', '#clutch', '#highlights'],
    likes: 729000, views: 13100000, verified: true, duration: '0:55', trending: true,
  },
  {
    id: 'gm2', category: 'gaming', aspectRatio: 'portrait',
    thumbnail: img(418, 360, 450), creatorAvatar: av(238), creatorName: 'levelup',
    caption: 'Every new player needs to learn these mechanics before anything else 🕹️',
    hashtags: ['#tutorial', '#beginner', '#gamingtips'],
    likes: 156000, views: 2900000, verified: false, duration: '4:30', trending: false,
  },
  {
    id: 'gm3', category: 'gaming', aspectRatio: 'square',
    thumbnail: img(429, 400, 400), creatorAvatar: av(239), creatorName: 'proplay',
    caption: 'Speedrun world record attempt — live reaction included 😭🏆',
    hashtags: ['#speedrun', '#worldrecord', '#gaming'],
    likes: 1100000, views: 19800000, verified: true, duration: '1:08', trending: true,
  },
];
