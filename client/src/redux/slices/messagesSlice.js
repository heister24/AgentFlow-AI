import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    selectedConvMsgs: [],
  },
  reducers: {
    setSelectedConvMsg: (state, action) => {
      state.selectedConvMsgs = action.payload;
    },
  },
});

export const { setSelectedConvMsg } = messageSlice.actions;
export default messageSlice.reducer;
