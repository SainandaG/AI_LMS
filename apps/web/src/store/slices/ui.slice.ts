import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light' | 'system';
  notificationsOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'dark',
  notificationsOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, toggleNotifications } = uiSlice.actions;
