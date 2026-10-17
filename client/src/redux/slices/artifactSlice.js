import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeArtifact: null, // { id, type, files: [{ name, content }] }
  selectedFileName: "",
  activeTab: "code", // 'code' | 'preview'
  isOpen: false,
  isFullscreen: false,
};

const artifactSlice = createSlice({
  name: "artifact",
  initialState,
  reducers: {
    setActiveArtifact: (state, action) => {
      const artifact = action.payload;
      state.activeArtifact = artifact;
      if (
        artifact &&
        Array.isArray(artifact.files) &&
        artifact.files.length > 0
      ) {
        state.selectedFileName = artifact.files[0].name;
        const hasHtml = artifact.files.some((f) =>
          f.name?.toLowerCase().endsWith(".html"),
        );
        state.activeTab = hasHtml ? "preview" : "code";
        state.isOpen = true;
      }
    },
    setSelectedFileName: (state, action) => {
      state.selectedFileName = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setArtifactOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    toggleArtifactOpen: (state) => {
      state.isOpen = !state.isOpen;
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    clearArtifact: (state) => {
      state.activeArtifact = null;
      state.selectedFileName = "";
      state.isOpen = false;
      state.isFullscreen = false;
    },
  },
});

export const {
  setActiveArtifact,
  setSelectedFileName,
  setActiveTab,
  setArtifactOpen,
  toggleArtifactOpen,
  toggleFullscreen,
  clearArtifact,
} = artifactSlice.actions;

export default artifactSlice.reducer;
