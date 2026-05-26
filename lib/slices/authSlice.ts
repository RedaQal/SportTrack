import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const defaultGoals = [
  { id: 'g1', type: 'workouts' as const, label: 'Séances / semaine', target: 4, current: 0, unit: 'séances' },
  { id: 'g2', type: 'calories' as const, label: 'Calories / semaine', target: 2000, current: 0, unit: 'kcal' },
  { id: 'g3', type: 'weight' as const, label: 'Objectif poids', target: 75, current: 82, unit: 'kg' },
];

const mockUser: User = {
  id: 'u1',
  name: 'Alex Martin',
  email: 'alex.martin@email.com',
  age: 28,
  weight: 82,
  height: 178,
  goals: defaultGoals,
  createdAt: new Date().toISOString(),
};

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      return { user: JSON.parse(stored), isAuthenticated: true, loading: false };
    }
  }
  return { user: null, isAuthenticated: false, loading: false };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      // Mock auth - accept any credentials
      state.user = { ...mockUser, email: action.payload.email };
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    },
    register: (state, action: PayloadAction<{ name: string; email: string; password: string }>) => {
      state.user = { ...mockUser, name: action.payload.name, email: action.payload.email };
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(state.user));
        }
      }
    },
    updateGoal: (state, action: PayloadAction<{ id: string; target?: number; current?: number }>) => {
      if (state.user) {
        state.user.goals = state.user.goals.map(g =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { login, register, logout, updateProfile, updateGoal } = authSlice.actions;
export default authSlice.reducer;
