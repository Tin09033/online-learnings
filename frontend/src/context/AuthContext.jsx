import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Seed from localStorage so pages don't flash-redirect on hard refresh
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const setUserAndPersist = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  // Listen for the axios interceptor event so we can navigate via React Router
  // instead of window.location.href (which crashes framer-motion animations)
  useEffect(() => {
    const handleForceLogout = () => {
      setUserAndPersist(null);
      if (window.location.pathname !== '/login') {
        navigateRef.current('/login', { replace: true });
      }
    };
    window.addEventListener('auth:logout-required', handleForceLogout);
    return () => window.removeEventListener('auth:logout-required', handleForceLogout);
  }, [setUserAndPersist]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authAPI.getMe();
        const userData = response.data.user || response.data;
        setUserAndPersist(userData);
      } catch (error) {
        // If /auth/me fails, clear persisted user — interceptor handles redirect
        setUserAndPersist(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [setUserAndPersist]);

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.user || response.data;
      setUserAndPersist(userData);
      return userData;
    } catch (error) {
      setUserAndPersist(null);
      return null;
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const userData = response.data.user;
    setUserAndPersist(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    const userData = response.data.user;
    setUserAndPersist(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUserAndPersist(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
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
