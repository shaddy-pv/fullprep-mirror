import { create } from "zustand";

export interface EditorSettings {
  fontSize: number;
  theme: string;
  wordWrap: "on" | "off";
  minimap: boolean;
  lineNumbers: "on" | "off";
  tabSize: number;
}

interface EditorState {
  settings: EditorSettings;
  isFullscreen: boolean;
  activeTab: "testcase" | "result" | "console";
  language: string;
  updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  setIsFullscreen: (full: boolean) => void;
  setActiveTab: (tab: "testcase" | "result" | "console") => void;
  setLanguage: (lang: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  settings: {
    fontSize: 14,
    theme: "vs-dark",
    wordWrap: "on",
    minimap: true,
    lineNumbers: "on",
    tabSize: 4,
  },
  isFullscreen: false,
  activeTab: "testcase",
  language: "javascript",
  updateSetting: (key, value) => set((state) => ({
    settings: { ...state.settings, [key]: value }
  })),
  setIsFullscreen: (full) => set({ isFullscreen: full }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLanguage: (lang) => set({ language: lang }),
}));
