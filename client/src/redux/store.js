import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import conversationReducer from "./slices/conversationSlice";
import messageReducer from "./slices/messagesSlice";
import artifactReducer from "./slices/artifactSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
    message: messageReducer,
    artifact: artifactReducer,
  },
});
