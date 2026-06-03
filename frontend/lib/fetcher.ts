import { ApiError } from "./error-handler";

interface FetcherOptions extends RequestInit {
  timeout?: number;
}

export async function fetcher<T>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { timeout = 10000, ...customOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...customOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(customOptions.headers || {}),
      },
    });

    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || "Failed to fetch data from API.",
        errorData.errors
      );
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
}
