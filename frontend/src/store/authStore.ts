import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CandidateAuthResponse, Enterprise } from '@/services/api';

export type UserRole = 'admin' | 'candidate' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  enterprise: Enterprise | null;
  candidateSession: CandidateAuthResponse | null;
  
  // Actions
  setAdminAuth: (enterprise: Enterprise) => void;
  setCandidateAuth: (session: CandidateAuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      role: null,
      enterprise: null,
      candidateSession: null,

      setAdminAuth: (enterprise) =>
        set({
          isAuthenticated: true,
          role: 'admin',
          enterprise,
          candidateSession: null,
        }),

      setCandidateAuth: (session) =>
        set({
          isAuthenticated: true,
          role: 'candidate',
          enterprise: null,
          candidateSession: session,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          role: null,
          enterprise: null,
          candidateSession: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        enterprise: state.enterprise,
        candidateSession: state.candidateSession,
      }),
    }
  )
);
