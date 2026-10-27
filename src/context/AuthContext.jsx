import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api, setAuthToken, getAuthToken, setStoredUser, getStoredUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [authError, setAuthError] = useState(null);
  const lastActivityAt = useRef(Date.now());
  const lastSessionRefreshAt = useRef(Date.now());

  const logout = useCallback(() => {
    if (getAuthToken()) {
      api.logoutSession().catch((error) => {
        if (!error.message.includes('credentials')) {
          console.warn('Unable to revoke the server session during sign out:', error.message);
        }
      });
    }
    setAuthToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  // Validate token against trusted database on startup
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setInitialChecking(false);
        return;
      }

      try {
        const verifiedUser = await api.getMe();
        if (verifiedUser && verifiedUser.is_active) {
          // Merge with session metadata
          const current = getStoredUser() || {};
          const fullUser = {
            ...current,
            id: verifiedUser.id,
            email: verifiedUser.email,
            role: verifiedUser.role, // Trusted role from database
            full_name: verifiedUser.full_name,
            must_change_password: verifiedUser.must_change_password,
          };
          setUser(fullUser);
          setStoredUser(fullUser);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification error:', err.message);
        // Clear invalid/expired session
        logout();
      } finally {
        setInitialChecking(false);
      }
    };

    verifySession();
  }, []);

  const login = async (username, password, expected_role = null) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await api.login(username, password, expected_role);

      // Verify the returned role is trusted
      if (!data || !data.access_token || !data.role) {
        throw new Error('Authentication failed: Invalid credentials or role response');
      }

      setAuthToken(data.access_token);
      setStoredUser(data);
      setToken(data.access_token);
      setUser(data);
      lastActivityAt.current = Date.now();
      lastSessionRefreshAt.current = Date.now();
      return data;
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.changePassword(currentPassword, newPassword);
    setUser((current) => {
      const updated = { ...current, must_change_password: false };
      setStoredUser(updated);
      return updated;
    });
  };

  useEffect(() => {
    if (!token) return undefined;
    const idleLimit = 30 * 60 * 1000;
    const noteActivity = () => {
      if (Date.now() - lastActivityAt.current >= idleLimit) {
        logout();
        return;
      }
      lastActivityAt.current = Date.now();
    };
    const refreshIfActive = async () => {
      const now = Date.now();
      if (now - lastActivityAt.current >= idleLimit) {
        logout();
        return;
      }
      if (now - lastSessionRefreshAt.current < 5 * 60 * 1000) return;
      try {
        const session = await api.refreshSession();
        setAuthToken(session.access_token);
        setToken(session.access_token);
        setUser((current) => {
          const updated = { ...current, ...session };
          setStoredUser(updated);
          return updated;
        });
        lastSessionRefreshAt.current = Date.now();
      } catch {
        logout();
      }
    };
    const activityEvents = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, noteActivity, { passive: true }));
    const interval = window.setInterval(refreshIfActive, 60 * 1000);
    const handleExpiredSession = () => logout();
    window.addEventListener('academiq:session-expired', handleExpiredSession);
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, noteActivity));
      window.clearInterval(interval);
      window.removeEventListener('academiq:session-expired', handleExpiredSession);
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        initialChecking,
        authError,
        login,
        logout,
        changePassword,
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
