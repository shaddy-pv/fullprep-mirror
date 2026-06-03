import { create } from "zustand";

interface ToastNotification {
  show: boolean;
  message: string;
  type: "success" | "info";
}

interface NotificationState {
  toast: ToastNotification;
  showToast: (message: string, type?: "success" | "info") => void;
  hideToast: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return {
    toast: { show: false, message: "", type: "success" },
    showToast: (message, type = "success") => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      set({ toast: { show: true, message, type } });
      timeoutId = setTimeout(() => {
        set({ toast: { show: false, message: "", type } });
      }, 2500);
    },
    hideToast: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      set((state) => ({ toast: { ...state.toast, show: false } }));
    },
  };
});
