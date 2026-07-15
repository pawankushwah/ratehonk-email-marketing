import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BusinessState {
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string | null) => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      activeBusinessId: null,
      setActiveBusinessId: (id) => set({ activeBusinessId: id }),
    }),
    {
      name: 'ratehonk-business-storage',
    }
  )
);
