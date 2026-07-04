'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  admin: FirebaseUser | null;
  mongoAdmin: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<FirebaseUser | null>(null);
  const [mongoAdmin, setMongoAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoggingIn = React.useRef(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    isLoggingIn.current = true;
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();

      // Create session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      });

      // Fetch MongoDB Admin profile to verify permission/status
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (!res.ok) {
        // If not found in database or suspended, sign out of Firebase
        await signOut(auth);
        await fetch('/api/auth/session', { method: 'DELETE' });
        throw new Error(data.error || 'Access denied');
      }

      setMongoAdmin(data.admin);
    } catch (error) {
      console.error('Admin Login failed:', error);
      await signOut(auth).catch(() => {});
      throw error;
    } finally {
      setLoading(false);
      isLoggingIn.current = false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Remove session cookie
      await fetch('/api/auth/session', { method: 'DELETE' });
      setAdmin(null);
      setMongoAdmin(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setAdmin(firebaseUser);
        
        if (isLoggingIn.current) {
           setLoading(false);
           return;
        }

        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            setMongoAdmin(data.admin);
          } else {
            // Deny and sign out of Firebase if profile sync fails
            await signOut(auth);
            await fetch('/api/auth/session', { method: 'DELETE' });
            setAdmin(null);
            setMongoAdmin(null);
          }
        } catch (err) {
          console.error('Sync error on admin auth state change:', err);
          setAdmin(null);
          setMongoAdmin(null);
        }
      } else {
        setAdmin(null);
        setMongoAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ admin, mongoAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
