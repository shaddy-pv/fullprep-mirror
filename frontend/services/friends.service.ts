import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface FriendData {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  xp: number;
  level: number;
  globalRank: number;
}

export interface FriendRequestData {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  status: string;
  createdAt: string;
}

export const FriendsService = {
  async getFriends() {
    return api.get<{ success: boolean; data: FriendData[] }>(`${BASE_URL}/friends`);
  },

  async getPendingRequests() {
    return api.get<{ success: boolean; data: FriendRequestData[] }>(`${BASE_URL}/friends/requests`);
  },

  async sendRequest(receiverId: string) {
    return api.post<{ success: boolean; message: string }>(`${BASE_URL}/friends/request/${receiverId}`, {});
  },

  async acceptRequest(senderId: string) {
    return api.post<{ success: boolean; message: string }>(`${BASE_URL}/friends/accept/${senderId}`, {});
  },

  async rejectRequest(senderId: string) {
    return api.post<{ success: boolean; message: string }>(`${BASE_URL}/friends/reject/${senderId}`, {});
  }
};
