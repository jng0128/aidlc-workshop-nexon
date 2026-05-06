import { create } from 'zustand';

interface SseStore {
  isConnected: boolean;
  lastEvent: any | null;
  setConnected: (connected: boolean) => void;
  setLastEvent: (event: any) => void;
}

export const useSseStore = create<SseStore>((set) => ({
  isConnected: false,
  lastEvent: null,
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setLastEvent: (event: any) => set({ lastEvent: event }),
}));
