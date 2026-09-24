/**
 * Authentication Service
 * Communicates with POST /api/auth/login or local mock store
 */
import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      // In development/mock mode: Validate demo credentials
      if (email.toLowerCase().trim() === 'admin@schoolerp.in' && password === 'admin123') {
        const mockAuth = {
          success: true,
          token: 'mock-jwt-token-xyz-12345-schoolerp',
          user: {
            id: 'usr-admin-1',
            name: 'Rajesh Verma',
            email: 'admin@schoolerp.in',
            role: 'Super Admin',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5ukJXdWj_VS8soatiNs2rFXpWuFevt9bsL0d2P70LwJlP64wMiKOx-hgAlc8BaoWOLwQEkiifz53boIPJyku7Yqg-N8oZrCaLpiXhTar7uSJUlQO3_E8Ow7NwNeGRii5v1pTyDEUf7FJZXGsbg15kWMYImJxBwAEUAw1e1-lIo-TPW9d1fweU2IZvFs-7QfNnOj1uupY6A_hGCZ7d3OFd00pvUq8ErbDdnMVt6S78ITFlIisZMXa',
            schoolName: 'Vidya Mandir Academy',
            academicYear: '2026–27',
          },
        };
        return mockAuth;
      }
      throw new Error('Invalid email or password. Please use admin@schoolerp.in and admin123.');
    }
  },

  getCurrentUser: () => {
    try {
      const raw = localStorage.getItem('schoolerp_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('schoolerp_token');
  },

  logout: () => {
    localStorage.removeItem('schoolerp_token');
    localStorage.removeItem('schoolerp_user');
  },
};
