import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationType } from '@/types';

interface UIState {
  notifications: Notification[];
  sidebarOpen: boolean;
}

const initialState: UIState = {
  notifications: [],
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<{ type: NotificationType; message: string }>) => {
      state.notifications.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { addNotification, removeNotification, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
