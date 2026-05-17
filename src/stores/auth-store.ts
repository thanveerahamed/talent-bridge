import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile, UserRole } from '@/types';

interface AuthState {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  activeRole: UserRole;
  loading: boolean;
  setFirebaseUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setActiveRole: (role: UserRole) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userProfile: null,
  activeRole: 'seeker',
  loading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setUserProfile: (profile) =>
    set({
      userProfile: profile,
      activeRole: profile?.activeRole ?? 'seeker',
    }),
  setActiveRole: (role) => set({ activeRole: role }),
  setLoading: (loading) => set({ loading }),
  reset: () =>
    set({
      firebaseUser: null,
      userProfile: null,
      activeRole: 'seeker',
      loading: false,
    }),
}));
