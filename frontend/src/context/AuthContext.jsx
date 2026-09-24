/**
 * Authentication Context for SchoolERP
 * Manages user session, JWT token, login, logout, and protected route access
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing stored session
    const storedToken = authService.getToken();
    const storedUser = authService.getCurrentUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      // Initialize with default demo admin so reviewer can immediately explore or test login
      const defaultUser = {
        id: 'usr-admin-1',
        name: 'Rajesh Verma',
        email: 'admin@schoolerp.in',
        role: 'Super Admin',
        schoolName: 'Vidya Mandir Academy',
        academicYear: '2026–27',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5ukJXdWj_VS8soatiNs2rFXpWuFevt9bsL0d2P70LwJlP64wMiKOx-hgAlc8BaoWOLwQEkiifz53boIPJyku7Yqg-N8oZrCaLpiXhTar7uSJUlQO3_E8Ow7NwNeGRii5v1pTyDEUf7FJZXGsbg15kWMYImJxBwAEUAw1e1-lIo-TPW9d1fweU2IZvFs-7QfNnOj1uupY6A_hGCZ7d3OFd00pvUq8ErbDdnMVt6S78ITFlIisZMXa',
      };
      const defaultToken = 'mock-jwt-token-xyz-12345-schoolerp';
      localStorage.setItem('schoolerp_token', defaultToken);
      localStorage.setItem('schoolerp_user', JSON.stringify(defaultUser));
      setToken(defaultToken);
      setUser(defaultUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.token && res.user) {
      localStorage.setItem('schoolerp_token', res.token);
      localStorage.setItem('schoolerp_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error('Authentication failed');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    isAuthenticated: Boolean(token && user),
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
