import React, { useState, useEffect } from 'react';
import { authApi, type User } from '../features/auth/api/authApi';
import { AuthContext, type AuthContextType } from './authContextInstance';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check real backend session cookie on app mount
  useEffect(() => {
    let isMounted = true;

    authApi.getMe()
      .then((response) => {
        if (isMounted && response?.user) {
          setUser(response.user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshSession = async () => {
    try {
      const response = await authApi.getMe();
      if (response && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    const response = await authApi.login(username, password);
    setUser(response.user);
    return response.user;
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<User> => {
    const response = await authApi.register(data);
    return response.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
