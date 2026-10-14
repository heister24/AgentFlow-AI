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
    addMsgToSelectedConv: (state, action) => {
      state.selectedConvMsgs.push(action.payload);
    },
  },
});

export const { setSelectedConvMsg, addMsgToSelectedConv } =
  messageSlice.actions;
export default messageSlice.reducer;
