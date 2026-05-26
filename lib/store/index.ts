import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/slices/authSlice';
import workoutReducer from '@/lib/slices/workoutSlice';
import uiReducer from '@/lib/slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workout: workoutReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
