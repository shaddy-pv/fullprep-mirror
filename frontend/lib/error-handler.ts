export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      return "Session expired. Please log in again.";
    }
    if (error.statusCode === 422 && error.errors) {
      return Object.values(error.errors).flat().join(", ");
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected network error occurred.";
}
