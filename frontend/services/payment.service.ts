import { api } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL &&
  process.env.NEXT_PUBLIC_API_BASE_URL !== "" &&
  process.env.NEXT_PUBLIC_API_BASE_URL !== "/"
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "https://fullprep-frontend-mirror.onrender.com/api";

export const PaymentService = {
  /**
   * Creates a Razorpay order for the Premium plan (Rs.399/month).
   * Returns the order object + Razorpay key_id.
   */
  async createOrder(): Promise<{ order: any; key: string; user: { name: string; email: string } }> {
    const response = await api.post<{
      success: boolean;
      order: any;
      key: string;
      user: { name: string; email: string };
    }>(`${BASE_URL}/payment/create-order`, {});

    if (!response?.success) {
      throw new Error("Failed to create payment order.");
    }
    return { order: response.order, key: response.key, user: response.user };
  },

  /**
   * Verifies the Razorpay payment signature with the backend.
   * On success, backend sets user.subscriptionTier = "premium" for 30 days.
   */
  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ proExpiresAt: string; user: any }> {
    const response = await api.post<{
      success: boolean;
      message: string;
      proExpiresAt: string;
      user: any;
    }>(`${BASE_URL}/payment/verify`, data);

    if (!response?.success) {
      throw new Error(response?.message || "Payment verification failed.");
    }
    return { proExpiresAt: response.proExpiresAt, user: response.user };
  },

  /**
   * Fetches the user's payment history.
   */
  async getPaymentHistory(): Promise<any[]> {
    try {
      const response = await api.get<{ success: boolean; paymentHistory: any[] }>(
        `${BASE_URL}/payment/history`
      );
      return response?.paymentHistory || [];
    } catch {
      return [];
    }
  },
};
