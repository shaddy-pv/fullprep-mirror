import { fetcher } from "./fetcher";

export const api = {
  get: <T>(url: string, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body: unknown, options?: RequestInit) =>
    fetcher<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(url: string, body: unknown, options?: RequestInit) =>
    fetcher<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "DELETE" }),
};
