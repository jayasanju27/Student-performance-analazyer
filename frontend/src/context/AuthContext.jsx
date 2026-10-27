import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken, setStoredUser, getStoredUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await api.login(username, password);
      setAuthToken(data.access_token);
      setStoredUser(data);
      setToken(data.access_token);
      setUser(data);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
  };

  const quickSwitch = async (targetRole) => {
    setLoading(true);
    try {
      if (targetRole === 'admin') {
        return await login('admin@college.com', 'admin123');
      } else if (targetRole === 'faculty') {
        return await login('faculty@college.com', 'faculty123');
      } else if (targetRole === 'student') {
        return await login('student@college.com', 'student123');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        authError,
        login,
        logout,
        quickSwitch,
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
