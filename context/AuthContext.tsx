"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, User, onAuthFailure } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pg: { name: string; area: string; city: string; state: string; landmark?: string };
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthUserResponse = User & { id?: string };

const normalizeUser = (value: AuthUserResponse | null | undefined): User | null => {
  if (!value) return null;
  return {
    ...value,
    _id: value._id || value.id || '',
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Silent refresh & fetch profile on boot or re-check
  const refreshUser = useCallback(async () => {
    try {
      // 1. Silent token refresh using HttpOnly cookie to get fresh Access Token
      await api.auth.refresh();
      // 2. Fetch authenticated user profile with valid access token
      const res = await api.auth.me();
      setUser(normalizeUser(res.data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen for automatic token expiration / refresh failures from API client
    const unsubscribe = onAuthFailure(() => {
      setUser(null);
    });

    return () => {
      unsubscribe();
    };
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setUser(normalizeUser(res.user));
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pg: { name: string; area: string; city: string; state: string; landmark?: string };
  }) => {
    setLoading(true);
    try {
      const res = await api.auth.register(payload);
      setUser(normalizeUser(res.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore logout errors — clear local state regardless
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

