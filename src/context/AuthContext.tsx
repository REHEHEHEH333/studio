'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile, createUserProfile, isFirstUser, findUserByEmail } from '@/lib/firestore';
import type { UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'response-ready-user-session';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem(USER_SESSION_KEY);
    if (session) {
      try {
        const userData: UserProfile = JSON.parse(session);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user session", error);
        localStorage.removeItem(USER_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const userProfile = await findUserByEmail(email);
      // NOTE: This is an insecure password check. In a real application,
      // you should NEVER store or compare plaintext passwords.
      // This is for demonstration purposes only, as requested.
      if (userProfile && userProfile.password === pass) {
        setUser(userProfile);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userProfile));
        router.push('/');
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }

      const firstUser = await isFirstUser();
      const role = firstUser ? 'commissioner' : 'user';

      const newUserProfile: Omit<UserProfile, 'uid'> = { name, email, role, password: pass };
      const newUserId = await createUserProfile(newUserProfile);
      const userProfile = { uid: newUserId, ...newUserProfile };
      setUser(userProfile);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userProfile));
      router.push('/');
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    router.push('/login');
  };

  const value = { user, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
