import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    selectedConvMsgs: [],
    isAgentThinking: false,
  },
  reducers: {
    setSelectedConvMsg: (state, action) => {
      state.selectedConvMsgs = action.payload;
    },
    addMsgToSelectedConv: (state, action) => {
      state.selectedConvMsgs.push(action.payload);
    },
    setAgentThinking: (state, action) => {
      state.isAgentThinking = Boolean(action.payload);
    },
  },
});

export const { setSelectedConvMsg, addMsgToSelectedConv, setAgentThinking } =
  messageSlice.actions;
export default messageSlice.reducer;
