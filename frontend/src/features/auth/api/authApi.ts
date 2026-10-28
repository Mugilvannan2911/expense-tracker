import { apiClient } from '../../../shared/api/apiClient';

export interface User {
  id: number | string;
  username: string;
  email: string;
  phone?: string | null;
  created_at?: string;
}

export interface LoginResponse {
  status: 'success';
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  status: 'success';
  message: string;
  user: User;
}

export interface MeResponse {
  status: 'success';
  user: User;
}

export interface LogoutResponse {
  status: 'success';
  message: string;
}

export const authApi = {
  /**
   * Log in with username/email/phone and password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Register a new user
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<RegisterResponse> {
    return apiClient<RegisterResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetch current authenticated user session
   */
  async getMe(): Promise<MeResponse> {
    return apiClient<MeResponse>('/api/users/me', {
      method: 'GET',
    });
  },

  /**
   * Logout user and clear session cookie
   */
  async logout(): Promise<LogoutResponse> {
    return apiClient<LogoutResponse>('/api/users/logout', {
      method: 'POST',
    });
  },
};
