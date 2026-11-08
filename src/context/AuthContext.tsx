// Context files intentionally export both a Provider component and a hook.
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  DevSession,
  getDevSession,
  createDevSession,
  clearDevSession,
  isValidEmail,
} from '@/services/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The active session, or null when signed out. */
  session: DevSession | null;
  /** True while the initial session is being read from storage. */
  loading: boolean;
  /** Error message from a failed sign-in attempt. */
  authError: string | null;
  /** Sign in with an email address. Returns false if validation fails. */
  signIn: (email: string) => boolean;
  /** Sign out and clear the local session. */
  signOut: () => void;
  /** Clear any displayed auth error. */
  clearAuthError: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<DevSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore existing session on mount (e.g. after a hot-reload in development).
  useEffect(() => {
    setSession(getDevSession());
    setLoading(false);
  }, []);

  const signIn = useCallback((email: string): boolean => {
    setAuthError(null);

    if (!email.trim()) {
      setAuthError('Please enter your email address to continue.');
      return false;
    }

    if (!isValidEmail(email)) {
      setAuthError('Please enter a valid email address.');
      return false;
    }

    const newSession = createDevSession(email);
    setSession(newSession);
    return true;
  }, []);

  const signOut = useCallback(() => {
    clearDevSession();
    setSession(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, authError, signIn, signOut, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
