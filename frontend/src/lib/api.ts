'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  user_id: number;
  priority?: string;
  starred?: boolean;
  tags?: string[];
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

interface User {
  id: number;
  email: string;
  name: string;
}

// Token management
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  console.log('[API] getStoredToken:', token ? `${token.substring(0, 20)}...` : 'null');
  return token;
}

function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    console.log('[API] Storing token:', token.substring(0, 20) + '...');
    window.localStorage.setItem(TOKEN_KEY, token);
    // Verify it was stored
    const stored = window.localStorage.getItem(TOKEN_KEY);
    console.log('[API] Token stored successfully:', stored === token);
  }
}

function storeUser(user: User): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('[API] User stored:', user.id, user.email);
  }
}

function clearStorage(): void {
  if (typeof window !== 'undefined') {
    console.log('[API] Clearing storage');
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

// Core request function
async function makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('[API] WARNING: No token available for request to', endpoint);
  }

  console.log('[API] Making request to:', url);
  console.log('[API] Headers:', JSON.stringify(headers, null, 2));

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
      console.log('[API] Error response:', errorData);
    } catch {}

    if (response.status === 401) {
      console.log('[API] 401 Unauthorized - clearing storage');
      clearStorage();
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return { message: 'Success' } as T;
  }

  const data = await response.json();
  console.log('[API] Response data:', data);
  return data;
}

// API client
export const apiClient = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    console.log('[API] === LOGIN START ===');
    const url = `${API_BASE_URL}/auth/login`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    console.log('[API] Login response status:', response.status);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    console.log('[API] Login successful, token received:', data.access_token.substring(0, 20) + '...');
    console.log('[API] User:', data.user);

    // Store token IMMEDIATELY
    storeToken(data.access_token);
    storeUser(data.user);

    console.log('[API] === LOGIN END ===');
    return data;
  },

  async register(credentials: { email: string; password: string; name: string }): Promise<LoginResponse> {
    console.log('[API] === REGISTER START ===');
    const url = `${API_BASE_URL}/auth/register`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    console.log('[API] Register response status:', response.status);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }

    const data: LoginResponse = await response.json();
    console.log('[API] Register successful, token received:', data.access_token.substring(0, 20) + '...');

    // Store token IMMEDIATELY
    storeToken(data.access_token);
    storeUser(data.user);

    console.log('[API] === REGISTER END ===');
    return data;
  },

  async getMe(): Promise<User> {
    console.log('[API] === GET ME ===');
    return makeRequest<User>('/auth/me');
  },

  logout(): void {
    console.log('[API] === LOGOUT ===');
    clearStorage();
  },

  async getTasks(userId: number): Promise<Task[]> {
    console.log('[API] === GET TASKS for user', userId, '===');
    return makeRequest<Task[]>(`/${userId}/tasks`);
  },

  async createTask(userId: number, task: {
    title: string;
    description?: string;
    priority?: string;
    starred?: boolean;
    tags?: string[];
    due_date?: string;
  }): Promise<Task> {
    console.log('[API] === CREATE TASK ===');
    return makeRequest<Task>(`/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async getTask(userId: number, taskId: number): Promise<Task> {
    return makeRequest<Task>(`/${userId}/tasks/${taskId}`);
  },

  async updateTask(userId: number, taskId: number, task: Partial<Task>): Promise<Task> {
    return makeRequest<Task>(`/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  async updateTaskCompletion(userId: number, taskId: number, completed: boolean): Promise<Task> {
    console.log('[API] === UPDATE TASK COMPLETION ===');
    return makeRequest<Task>(`/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  async deleteTask(userId: number, taskId: number): Promise<{ message: string }> {
    console.log('[API] === DELETE TASK ===');
    return makeRequest<{ message: string }>(`/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

export type { Task, LoginResponse, User };
