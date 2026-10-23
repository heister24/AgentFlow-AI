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
    updateConversationTitleInList: (state, action) => {
      const { id, title } = action.payload;
      const conv = state.conversations.find((c) => c._id === id);
      if (conv) {
        conv.title = title;
      }
      if (state.selectedConversation?._id === id) {
        state.selectedConversation.title = title;
      }
    },
  },
});

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  setSidebarOpen,
  toggleSidebar,
  updateConversationTitleInList,
} = conversationSlice.actions;
export default conversationSlice.reducer;
