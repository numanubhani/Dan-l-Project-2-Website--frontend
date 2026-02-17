
import React from 'react';
import { Video, UserRole, User } from './types';

export const COLORS = {
  primary: '#8b5cf6', // Purple-500
  secondary: '#a78bfa', // Purple-400
  background: '#000000',
  text: '#ffffff',
  accent: '#f5f3ff',
};

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/alex/200',
  role: UserRole.CREATOR,
  balance: 2450.50,
};

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    creatorId: 'c1',
    creatorName: 'ExtremeSports',
    creatorAvatar: 'https://picsum.photos/seed/sports/100',
    title: 'World Record Backflip Attempt!',
    description: 'Can I land this triple backflip on a jetpack? Watch till the end!',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/seed/v1/400/800',
    views: 125000,
    likes: 8500,
    comments: 420,
    type: 'short',
    betEvent: {
      id: 'b1',
      question: 'Will he land the triple backflip safely?',
      options: [
        { id: 'yes', text: 'Yes, Clean Landing', odds: 1.8 },
        { id: 'no', text: 'No, Epic Crash', odds: 2.2 }
      ],
      totalPool: 15400,
      participants: 1240,
      expiresAt: Date.now() + 3600000,
    }
  },
  {
    id: 'v2',
    creatorId: 'c2',
    creatorName: 'ChefMaster',
    creatorAvatar: 'https://picsum.photos/seed/chef/100',
    title: 'Mystery Box Challenge: 15 Minutes',
    description: 'Making a 5-star meal with only 3 ingredients.',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/seed/v2/400/800',
    views: 45000,
    likes: 3200,
    comments: 150,
    type: 'short',
    betEvent: {
      id: 'b2',
      question: 'Will the judges rate it 9/10 or higher?',
      options: [
        { id: 'yes', text: 'Yes', odds: 3.5 },
        { id: 'no', text: 'No', odds: 1.2 }
      ],
      totalPool: 8900,
      participants: 450,
      expiresAt: Date.now() + 1800000,
    }
  },
  {
    id: 'v3',
    creatorId: 'c3',
    creatorName: 'GamerGod',
    creatorAvatar: 'https://picsum.photos/seed/gamer/100',
    title: 'Speedrun: Elden Ring in 40 mins?',
    description: 'Pushing the limits of the new patch. Betting live.',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/seed/v3/800/400',
    views: 98000,
    likes: 7100,
    comments: 890,
    type: 'long',
    betEvent: {
      id: 'b3',
      question: 'Will he beat the current WR of 42:15?',
      options: [
        { id: 'yes', text: 'New WR', odds: 4.0 },
        { id: 'no', text: 'Fail / No WR', odds: 1.15 }
      ],
      totalPool: 42000,
      participants: 3400,
      expiresAt: Date.now() + 7200000,
    }
  },
  {
    id: 'v4',
    creatorId: 'c4',
    creatorName: 'AdventureSeeker',
    creatorAvatar: 'https://picsum.photos/seed/adventure/100',
    title: 'Climbing Mount Everest Base Camp',
    description: 'Journey to the base of the world\'s highest mountain. Epic views ahead!',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://picsum.photos/seed/v4/400/800',
    views: 67000,
    likes: 5200,
    comments: 280,
    type: 'short',
    betEvent: {
      id: 'b4',
      question: 'Will I reach base camp in under 10 days?',
      options: [
        { id: 'yes', text: 'Yes', odds: 2.5 },
        { id: 'no', text: 'No', odds: 1.6 }
      ],
      totalPool: 12000,
      participants: 890,
      expiresAt: Date.now() + 86400000,
    }
  },
  {
    id: 'v5',
    creatorId: 'c5',
    creatorName: 'TechWizard',
    creatorAvatar: 'https://picsum.photos/seed/tech/100',
    title: 'Building a PC in 10 Minutes Challenge',
    description: 'Can I assemble a gaming PC faster than ever? Watch me try!',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://picsum.photos/seed/v5/400/800',
    views: 89000,
    likes: 6400,
    comments: 520,
    type: 'short',
    betEvent: {
      id: 'b5',
      question: 'Will the PC boot on first try?',
      options: [
        { id: 'yes', text: 'Yes, Perfect Boot', odds: 3.0 },
        { id: 'no', text: 'No, Needs Fixing', odds: 1.4 }
      ],
      totalPool: 18000,
      participants: 1200,
      expiresAt: Date.now() + 5400000,
    }
  },
  {
    id: 'v6',
    creatorId: 'c6',
    creatorName: 'MusicMaverick',
    creatorAvatar: 'https://picsum.photos/seed/music/100',
    title: 'One-Take Music Video: Original Song',
    description: 'Filmed everything in one continuous shot. No cuts, no edits!',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    thumbnail: 'https://picsum.photos/seed/v6/400/800',
    views: 156000,
    likes: 11200,
    comments: 780,
    type: 'long',
    betEvent: {
      id: 'b6',
      question: 'Will this song hit 1M views in a week?',
      options: [
        { id: 'yes', text: 'Yes, Viral Hit', odds: 2.8 },
        { id: 'no', text: 'No', odds: 1.5 }
      ],
      totalPool: 25000,
      participants: 2100,
      expiresAt: Date.now() + 604800000,
    }
  }
];
