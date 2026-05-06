import { create } from 'zustand';

interface TableData {
  id: number;
  tableNumber: number;
  storeId: number;
}

interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  table: TableData | null;
  login: (token: string, table: TableData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  const storedToken = localStorage.getItem('customer-token');
  const storedTable = localStorage.getItem('customer-table');

  return {
    token: storedToken,
    isAuthenticated: !!storedToken,
    table: storedTable ? JSON.parse(storedTable) : null,

    login: (token: string, table: TableData) => {
      localStorage.setItem('customer-token', token);
      localStorage.setItem('customer-table', JSON.stringify(table));
      set({ token, isAuthenticated: true, table });
    },

    logout: () => {
      localStorage.removeItem('customer-token');
      localStorage.removeItem('customer-table');
      set({ token: null, isAuthenticated: false, table: null });
    },
  };
});
