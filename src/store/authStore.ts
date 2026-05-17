import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User, type UserRole } from '@/types';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      loading: true,
      setUser: (user) => set({ user, role: (user?.role ?? null) as UserRole | null }),
      setRole: (role) => set({ role }),
      setLoading: (loading) => set({ loading }),
      signOut: () => set({ user: null, role: null }),
    }),
    {
      name: 'rento-auth',
      partialize: (state) => ({ user: state.user, role: state.role }),
    }
  )
);
