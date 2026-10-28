import { createContext } from 'react';
import type { User } from '../features/auth/api/authApi';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
