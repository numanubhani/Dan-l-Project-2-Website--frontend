const API_BASE_URL = 'http://localhost:8000/api';

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
  user: User;
  token: string;
  message: string;
}

// Convert API user to frontend user format
export const convertApiUserToUser = (apiUser: User): any => {
  return {
    id: apiUser.id.toString(),
    name: apiUser.name || apiUser.username,
    avatar: apiUser.avatar_url || 'https://picsum.photos/seed/user/200',
    role: apiUser.role,
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
      throw new Error(error.detail || error.message || 'Registration failed');
    }

    const result: AuthResponse = await response.json();
    setAuthToken(result.token);
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
      throw new Error(error.detail || error.message || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    setAuthToken(result.token);
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
      throw new Error(error.detail || error.message || 'Failed to get user');
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
      throw new Error(error.detail || error.message || 'Failed to get profile');
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
      throw new Error(error.detail || error.message || 'Failed to update profile');
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
      throw new Error(error.detail || error.message || 'Failed to get user profile');
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
      throw new Error(error.detail || error.message || 'Failed to follow/unfollow');
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
      throw new Error(error.detail || error.message || 'Failed to get video');
    }

    return await response.json();
  },

  // Get user videos
  async getUserVideos(userId: string, type?: 'reels' | 'videos' | 'live'): Promise<any[]> {
    const url = type 
      ? `${API_BASE_URL}/videos/user/${userId}/?type=${type}`
      : `${API_BASE_URL}/videos/user/${userId}/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to get videos');
    }

    return await response.json();
  },

  // Get inbox
  async getInbox(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/inbox/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to get inbox');
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
      throw new Error(error.detail || error.message || 'Failed to get shop items');
    }

    return await response.json();
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

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/videos/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to upload video');
    }

    return await response.json();
  },
};

