export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://muhammadnumansubhan1.pythonanywhere.com/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  name?: string;
  role?: 'VIEWER' | 'CREATOR' | 'ADMIN';
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
  role: 'VIEWER' | 'CREATOR' | 'ADMIN';
  balance: number;
  date_joined: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  key?: string;
  access?: string;
  message?: string;
  [key: string]: any;
}

// Convert API user to frontend user format
export const convertApiUserToUser = (apiUser: User): any => {
  const normalizedRole = String(apiUser.role || 'VIEWER').toUpperCase();
  return {
    id: apiUser.id.toString(),
    name: apiUser.name || apiUser.username,
    avatar: apiUser.avatar_url || 'https://picsum.photos/seed/user/200',
    role: normalizedRole,
    balance: parseFloat(apiUser.balance.toString()),
  };
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Get headers with authentication
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
};

// Shared authorization header for non-JSON requests (e.g. FormData)
export const getAuthorizationHeader = (): string | null => {
  const token = getAuthToken();
  return token ? `Token ${token}` : null;
};

const extractToken = (payload: AuthResponse): string | null => {
  return payload.token || payload.key || payload.access || null;
};

const parseErrorMessage = (error: any, fallback: string): string => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) return error[0] || fallback;
  if (Array.isArray(error.detail)) return error.detail[0] || fallback;
  return error.detail || error.message || error.error || fallback;
};

// API Functions
export const api = {
  // Authentication
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Registration failed'));
    }

    const result: AuthResponse = await response.json();
    const token = extractToken(result);
    if (token) {
      setAuthToken(token);
    }
    return result;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Login failed'));
    }

    const result: AuthResponse = await response.json();
    const token = extractToken(result);
    if (token) {
      setAuthToken(token);
    } else {
      throw new Error('Login succeeded but no auth token was returned by the API.');
    }
    return result;
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      removeAuthToken();
    }
  },

  // Profile
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile/me/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Unauthorized');
      }
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get user'));
    }

    return await response.json();
  },

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Unauthorized');
      }
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get profile'));
    }

    return await response.json();
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile/update/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Unauthorized');
      }
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to update profile'));
    }

    return await response.json();
  },

  // User profile by ID
  async getUserProfile(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get user profile'));
    }

    return await response.json();
  },

  // Follow/Unfollow
  async toggleFollow(userId: string): Promise<{ is_following: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/follow/${userId}/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to follow/unfollow'));
    }

    return await response.json();
  },

  // Get a single video by ID
  async getVideo(videoId: string, preview: boolean = false): Promise<any> {
    const url = preview 
      ? `${API_BASE_URL}/videos/${videoId}/?preview=true`
      : `${API_BASE_URL}/videos/${videoId}/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get video'));
    }

    return await response.json();
  },

  // Get user videos
  async getUserVideos(userId: string, videoType?: 'short' | 'long' | 'live'): Promise<any[]> {
    const base = `${API_BASE_URL}/videos/user/${userId}/`;
    const headers = getAuthHeaders();

    const tryFetch = async (url: string) => {
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(parseErrorMessage(error, 'Failed to get videos'));
      }
      return (await response.json()) as any[];
    };

    if (!videoType) {
      return await tryFetch(base);
    }

    // Backends vary: some use `video_type`, others use `type`.
    try {
      return await tryFetch(`${base}?video_type=${encodeURIComponent(videoType)}`);
    } catch {
      return await tryFetch(`${base}?type=${encodeURIComponent(videoType)}`);
    }
  },

  // Get inbox
  async getInbox(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/inbox/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get inbox'));
    }

    return await response.json();
  },

  // Get shop items
  async getUserShopItems(userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/shop/${userId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get shop items'));
    }

    return await response.json();
  },

  // Place bet on a video bet marker (timestamp-based)
  async placeMarkerBet(markerId: number | string, optionId: number | string, amount: number): Promise<{ balance: number; bet_id: number }> {
    const response = await fetch(`${API_BASE_URL}/bets/place-marker/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ marker_id: markerId, option_id: optionId, amount }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to place bet'));
    }
    return await response.json();
  },

  // Place bet on a live bet event
  async placeEventBet(eventId: number | string, optionId: number | string, amount: number): Promise<{ balance: number; bet_id: number }> {
    const response = await fetch(`${API_BASE_URL}/bets/place-event/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ event_id: eventId, option_id: optionId, amount }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to place bet'));
    }
    return await response.json();
  },

  // Get feed videos (for reels/feed)
  async getFeedVideos(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/videos/feed/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get feed'));
    }
    return await response.json();
  },

  // Get user notifications
  async getNotifications(): Promise<Array<{ id: number; message: string; type: string; timestamp: number; is_read: boolean; link: string }>> {
    const response = await fetch(`${API_BASE_URL}/notifications/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) return [];
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to get notifications'));
    }
    return await response.json();
  },

  // Mark notification as read
  async markNotificationRead(notificationId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to mark read'));
    }
  },

  // Upload video
  async uploadVideo(data: {
    title: string;
    description?: string;
    video_file?: File;
    video_url?: string;
    thumbnail?: File;
    thumbnail_url?: string;
    video_type: 'short' | 'long' | 'live';
    bet_markers?: Array<{
      timestamp: number;
      question: string;
      options: Array<{ text: string; odds: number }>;
    }>;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.video_file) {
      formData.append('video_file', data.video_file);
    }
    if (data.video_url) {
      formData.append('video_url', data.video_url);
    }
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    if (data.thumbnail_url) {
      formData.append('thumbnail_url', data.thumbnail_url);
    }
    formData.append('video_type', data.video_type);
    formData.append('is_live', data.video_type === 'live' ? 'true' : 'false');
    
    if (data.bet_markers && data.bet_markers.length > 0) {
      formData.append('bet_markers', JSON.stringify(data.bet_markers));
    }

    const authorization = getAuthorizationHeader();
    const response = await fetch(`${API_BASE_URL}/videos/upload/`, {
      method: 'POST',
      headers: authorization ? { Authorization: authorization } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(parseErrorMessage(error, 'Failed to upload video'));
    }

    return await response.json();
  },
};

