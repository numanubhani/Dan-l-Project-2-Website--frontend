
export enum UserRole {
  VIEWER = 'VIEWER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  balance: number;
}

export interface BetEvent {
  id: string;
  question: string;
  options: { id: string; text: string; odds: number }[];
  totalPool: number;
  participants: number;
  expiresAt: number; // timestamp
}

export interface BetMarker {
  id: string;
  timestamp: number; // in seconds
  question: string;
  options: { id: string; text: string; odds: number }[];
  totalPool: number;
  participants: number;
}

export interface Video {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  betEvent?: BetEvent;
  betMarkers?: BetMarker[]; // Betting markers at specific timestamps
  type: 'short' | 'long' | 'live';
}

export interface Notification {
  id: string;
  message: string;
  type: 'bet_win' | 'bet_loss' | 'new_video';
  timestamp: number;
}
