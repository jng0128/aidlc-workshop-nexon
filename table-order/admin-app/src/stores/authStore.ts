import { create } from 'zustand';
import { Admin } from '../types';

interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  admin: Admin | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Initialize from localStorage
  const storedToken = localStorage.getItem('token');
  const storedAdmin = localStorage.getItem('admin');

  return {
    token: storedToken,
    isAuthenticated: !!storedToken,
    admin: storedAdmin ? JSON.parse(storedAdmin) : null,

    login: (token: string, admin: Admin) => {
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      set({ token, isAuthenticated: true, admin });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      set({ token: null, isAuthenticated: false, admin: null });
    },
  };
});
