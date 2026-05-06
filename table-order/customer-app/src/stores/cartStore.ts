import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Menu } from '../types';

export interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (menu: Menu) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menu: Menu) => {
        const { items } = get();
        const existing = items.find((item) => item.menuId === menu.id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.menuId === menu.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                menuId: menu.id,
                menuName: menu.name,
                price: menu.price,
                quantity: 1,
                imageUrl: menu.imageUrl,
              },
            ],
          });
        }
      },

      removeItem: (menuId: number) => {
        set({ items: get().items.filter((item) => item.menuId !== menuId) });
      },

      updateQuantity: (menuId: number, quantity: number) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.menuId !== menuId) });
        } else {
          set({
            items: get().items.map((item) =>
              item.menuId === menuId ? { ...item, quantity } : item,
            ),
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'customer-cart',
    },
  ),
);
