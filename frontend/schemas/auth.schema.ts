export interface LoginInput {
  email: string;
  password?: string;
}

export interface SignupInput extends LoginInput {
  fullName: string;
  confirmPassword?: string;
}

export function validateLogin(data: LoginInput) {
  const errors: Record<string, string[]> = {};
  if (!data.email || !data.email.includes("@")) {
    errors.email = ["Invalid email address format."];
  }
  if (!data.password || data.password.length < 6) {
    errors.password = ["Password must be at least 6 characters."];
  }
  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSignup(data: SignupInput) {
  const errors: Record<string, string[]> = {};
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = ["Full Name is required."];
  }
  if (!data.email || !data.email.includes("@")) {
    errors.email = ["Invalid email address format."];
  }
  if (!data.password || data.password.length < 8) {
    errors.password = ["Password must be at least 8 characters."];
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }
  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}
