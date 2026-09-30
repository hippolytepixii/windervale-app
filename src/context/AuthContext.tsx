import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, LegalAcceptance } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  legalAcceptances: LegalAcceptance[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  oauthLogin: (provider: 'google' | 'apple', data: { email: string; name?: string; avatar_url?: string }) => Promise<{ isNewUser: boolean; email?: string; name?: string; message?: string }>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updatePrivacy: (data: { visibility?: string; location_visibility?: boolean }) => Promise<void>;
  verifyEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('windervale_token'));
  const [legalAcceptances, setLegalAcceptances] = useState<LegalAcceptance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = async () => {
    try {
      const storedToken = localStorage.getItem('windervale_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setLegalAcceptances(data.legal_acceptances || []);
    } catch (err) {
      console.error('Failed to load session:', err);
      localStorage.removeItem('windervale_token');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      localStorage.setItem('windervale_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      setLegalAcceptances(data.legal_acceptances || []);
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = async (provider: 'google' | 'apple', authData: { email: string; name?: string; avatar_url?: string }): Promise<{ isNewUser: boolean; email?: string; name?: string; message?: string }> => {
    setIsLoading(true);
    try {
      const data = await api.oauthLogin(provider, authData);
      if (data.isNewUser || data.registered === false) {
        return {
          isNewUser: true,
          email: data.email || authData.email,
          name: data.name || authData.name,
          message: data.message,
        };
      }
      if (data.token && data.user && data.profile) {
        localStorage.setItem('windervale_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.profile);
        setLegalAcceptances(data.legal_acceptances || []);
      }
      return { isNewUser: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('windervale_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      setLegalAcceptances([
        { id: 'acc-terms', user_id: res.user.id, doc_type: 'terms', doc_version: '1.0', accepted_at: new Date().toISOString(), status: 'accepted' },
        { id: 'acc-priv', user_id: res.user.id, doc_type: 'privacy', doc_version: '1.0', accepted_at: new Date().toISOString(), status: 'accepted' },
        { id: 'acc-guide', user_id: res.user.id, doc_type: 'guidelines', doc_version: '1.0', accepted_at: new Date().toISOString(), status: 'accepted' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('windervale_token');
    setUser(null);
    setProfile(null);
    setToken(null);
    setLegalAcceptances([]);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setLegalAcceptances(data.legal_acceptances || []);
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const res = await api.updateProfile(data);
    setProfile(res.profile);
    if (data.display_name && user) {
      setUser({ ...user, name: data.display_name });
    }
  };

  const updatePrivacy = async (data: { visibility?: string; location_visibility?: boolean }) => {
    await api.updatePrivacy(data);
    await refreshProfile();
  };

  const verifyEmail = async () => {
    await api.verifyEmail();
    if (user) {
      setUser({ ...user, email_verified: 1 });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        legalAcceptances,
        isLoading,
        login,
        oauthLogin,
        register,
        logout,
        refreshProfile,
        updateProfile,
        updatePrivacy,
        verifyEmail,
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
