import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pwd: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; preferences?: Partial<UserPreferences> }) => Promise<void>;
  logout: () => void;
  quickDemoLogin: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { user } = await api.getMe();
        setUser(user);
      } catch (err) {
        console.warn('Auto-login session expired:', err);
        api.setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, pwd: string) => {
    const res = await api.login(email, pwd);
    setUser(res.user);
  };

  const signup = async (payload: { name: string; email: string; password: string; preferences?: Partial<UserPreferences> }) => {
    const res = await api.signup(payload);
    setUser(res.user);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async () => {
    const res = await api.login('demo@nala.ai', 'password123');
    setUser(res.user);
  };

  const updateUserPreferences = async (prefs: Partial<UserPreferences>) => {
    await api.updatePreferences(prefs);
    if (user) {
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...prefs,
        } as UserPreferences,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        quickDemoLogin,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
