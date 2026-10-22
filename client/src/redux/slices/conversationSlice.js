import { createSlice } from "@reduxjs/toolkit";

const isMobile =
  typeof window !== "undefined" ? window.innerWidth < 768 : false;

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation: null,
    sidebarOpen: !isMobile,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = Boolean(action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  setSidebarOpen,
  toggleSidebar,
} = conversationSlice.actions;
export default conversationSlice.reducer;
