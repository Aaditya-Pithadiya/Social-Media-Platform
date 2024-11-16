import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [], // Array to store notifications
  },
  reducers: {
    setLikeNotification: (state, action) => {
      if (action.payload.type === "like") {
        // Check if the notification already exists
        const exists = state.likeNotification.some(
          (item) => item.userId === action.payload.userId && item.postId === action.payload.postId
        );
        if (!exists) {
          state.likeNotification.push(action.payload);
        }
      } else if (action.payload.type === "dislike") {
        // Remove notification matching userId and postId
        state.likeNotification = state.likeNotification.filter(
          (item) => !(item.userId === action.payload.userId && item.postId === action.payload.postId)
        );
      }
    },
  },
});

export const { setLikeNotification } = rtnSlice.actions;
export default rtnSlice.reducer;
