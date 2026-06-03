export interface SubmitCodeInput {
  problemId: number;
  language: string;
  code: string;
}

export function validateSubmitCode(data: SubmitCodeInput) {
  const errors: Record<string, string[]> = {};
  if (!data.language || data.language.trim().length === 0) {
    errors.language = ["Language is required."];
  }
  if (!data.code || data.code.trim().length === 0) {
    errors.code = ["Code content cannot be empty."];
  }
  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}
