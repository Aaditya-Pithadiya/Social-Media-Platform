import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socketio",
  initialState: {
    isConnected: false, // Keep connection status
    userId: null,       // Store user-related metadata
  },
  reducers: {
    setSocketConnection: (state, action) => {
      state.isConnected = action.payload.isConnected;
      state.userId = action.payload.userId;
    },
  },
});

export const { setSocketConnection } = socketSlice.actions;
export default socketSlice.reducer;
