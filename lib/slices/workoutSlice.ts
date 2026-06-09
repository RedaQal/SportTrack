import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WorkoutSession, Exercise } from '@/types';

interface WorkoutState {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export const fetchSessionsThunk = createAsyncThunk(
  'workout/fetchSessions',
  async (days: number = 90, { rejectWithValue }) => {
    const token = getToken();
    const res = await fetch(`/api/sessions?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error);
    return data;
  }
);

export const addSessionThunk = createAsyncThunk(
  'workout/addSession',
  async (payload: Omit<WorkoutSession, 'id'>, { rejectWithValue }) => {
    const token = getToken();
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error);
    return data;
  }
);

export const deleteSessionThunk = createAsyncThunk(
  'workout/deleteSession',
  async (id: string, { rejectWithValue }) => {
    const token = getToken();
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.error);
    }
    return id;
  }
);

export const fetchExercisesThunk = createAsyncThunk(
  'workout/fetchExercises',
  async (_, { rejectWithValue }) => {
    const token = getToken();
    const res = await fetch('/api/exercises', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error);
    return data;
  }
);

const initialState: WorkoutState = {
  sessions: [],
  exercises: [],
  loading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionsThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchSessionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addSessionThunk.fulfilled, (state, action) => {
        state.sessions = [action.payload, ...state.sessions];
      });

    builder
      .addCase(deleteSessionThunk.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => String(s.id) !== action.payload);
      });

    builder
      .addCase(fetchExercisesThunk.fulfilled, (state, action) => {
        state.exercises = action.payload;
      });
  },
});

export default workoutSlice.reducer;