import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface AiMessage {
  _id?: string;
  sender: "user" | "assistant";
  text: string;
  code?: string;
  language?: string;
  approach?: string[];
  complexity?: {
    time: string;
    space: string;
  };
  timestamp?: string;
}

export interface AiChatHistory {
  _id: string;
  title: string;
  problemExternalId: string;
  messages: AiMessage[];
}

export interface AiChatResponse {
  message: AiMessage;
  hintsRemaining: number | "Unlimited";
}

export const aiService = {
  getChatHistory: async (problemId: string): Promise<any | null> => {
    try {
      const response: any = await api.get(`${BASE_URL}/ai/chat/${problemId}`);
      // Return the full response so the page can access hintsRemaining
      return response;
    } catch (error) {
      console.error("Error fetching AI chat history:", error);
      return null;
    }
  },

  sendChatMessage: async (
    problemId: string,
    payload: { text: string; userCode?: string; language?: string; problemContext?: string }
  ): Promise<AiChatResponse> => {
    const response: any = await api.post(`${BASE_URL}/ai/chat/${problemId}`, payload);
    // api.post returns the JSON directly: { success: true, message: {...}, hintsRemaining: ... }
    return { 
      message: response?.message || response?.data?.message, 
      hintsRemaining: response?.hintsRemaining || response?.data?.hintsRemaining 
    };
  },
};
