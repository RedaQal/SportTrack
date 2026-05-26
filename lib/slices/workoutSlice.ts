import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutSession, Exercise } from '@/types';
import { subDays, format } from 'date-fns';

const EXERCISES: Exercise[] = [
  { id: 'e1', name: 'Course à pied', category: 'cardio', icon: '🏃', caloriesPerMinute: 10 },
  { id: 'e2', name: 'Vélo', category: 'cardio', icon: '🚴', caloriesPerMinute: 8 },
  { id: 'e3', name: 'Natation', category: 'cardio', icon: '🏊', caloriesPerMinute: 9 },
  { id: 'e4', name: 'Musculation', category: 'strength', icon: '🏋️', caloriesPerMinute: 6 },
  { id: 'e5', name: 'Yoga', category: 'flexibility', icon: '🧘', caloriesPerMinute: 3 },
  { id: 'e6', name: 'HIIT', category: 'hiit', icon: '⚡', caloriesPerMinute: 12 },
  { id: 'e7', name: 'Football', category: 'sports', icon: '⚽', caloriesPerMinute: 9 },
  { id: 'e8', name: 'Tennis', category: 'sports', icon: '🎾', caloriesPerMinute: 8 },
  { id: 'e9', name: 'Boxe', category: 'hiit', icon: '🥊', caloriesPerMinute: 11 },
  { id: 'e10', name: 'Corde à sauter', category: 'cardio', icon: '🪢', caloriesPerMinute: 11 },
  { id: 'e11', name: 'Pilates', category: 'flexibility', icon: '🤸', caloriesPerMinute: 4 },
  { id: 'e12', name: 'Marche rapide', category: 'cardio', icon: '🚶', caloriesPerMinute: 5 },
];

const generateMockSessions = (): WorkoutSession[] => {
  const sessions: WorkoutSession[] = [];
  const exercisePairs = [
    [EXERCISES[0], EXERCISES[3]],
    [EXERCISES[5]],
    [EXERCISES[1], EXERCISES[4]],
    [EXERCISES[3], EXERCISES[8]],
    [EXERCISES[0]],
    [EXERCISES[6]],
    [EXERCISES[2], EXERCISES[4]],
    [EXERCISES[5], EXERCISES[3]],
    [EXERCISES[9]],
    [EXERCISES[1]],
  ];

  for (let i = 0; i < 10; i++) {
    const exercises = exercisePairs[i].map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      duration: Math.floor(Math.random() * 30) + 20,
      calories: Math.floor((Math.random() * 30 + 20) * (ex.caloriesPerMinute || 7)),
      sets: ex.category === 'strength' ? Math.floor(Math.random() * 3) + 3 : undefined,
      reps: ex.category === 'strength' ? Math.floor(Math.random() * 5) + 8 : undefined,
    }));

    sessions.push({
      id: `s${i}`,
      date: format(subDays(new Date(), i * 2 + Math.floor(Math.random() * 2)), 'yyyy-MM-dd'),
      exercises,
      totalCalories: exercises.reduce((sum, e) => sum + e.calories, 0),
      totalDuration: exercises.reduce((sum, e) => sum + e.duration, 0),
      mood: (Math.floor(Math.random() * 3) + 3) as 1 | 2 | 3 | 4 | 5,
    });
  }
  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

interface WorkoutState {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  loading: boolean;
}

const getInitialSessions = (): WorkoutSession[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('workout_sessions');
    if (stored) return JSON.parse(stored);
  }
  return generateMockSessions();
};

const initialState: WorkoutState = {
  sessions: [],
  exercises: EXERCISES,
  loading: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    initSessions: (state) => {
      state.sessions = getInitialSessions();
    },
    addSession: (state, action: PayloadAction<Omit<WorkoutSession, 'id'>>) => {
      const session: WorkoutSession = {
        ...action.payload,
        id: `s${Date.now()}`,
      };
      state.sessions = [session, ...state.sessions];
      if (typeof window !== 'undefined') {
        localStorage.setItem('workout_sessions', JSON.stringify(state.sessions));
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('workout_sessions', JSON.stringify(state.sessions));
      }
    },
    updateSession: (state, action: PayloadAction<WorkoutSession>) => {
      const idx = state.sessions.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) state.sessions[idx] = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('workout_sessions', JSON.stringify(state.sessions));
      }
    },
  },
});

export const { initSessions, addSession, deleteSession, updateSession } = workoutSlice.actions;
export { EXERCISES };
export default workoutSlice.reducer;
