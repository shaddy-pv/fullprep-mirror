import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
  isRead: boolean;
  createdAt: string;
}

export const NotificationsService = {
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get<{ success: boolean; data: NotificationItem[] }>(`${BASE_URL}/notifications`);
      if (response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      const response = await api.patch<{ success: boolean }>(`${BASE_URL}/notifications/${id}/read`, {});
      return response.success || false;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await api.patch<{ success: boolean }>(`${BASE_URL}/notifications/read-all`, {});
      return response.success || false;
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      return false;
    }
  },

  async clearAll(): Promise<boolean> {
    try {
      const response = await api.delete<{ success: boolean }>(`${BASE_URL}/notifications/clear-all`);
      return response.success || false;
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      return false;
    }
  }
};
