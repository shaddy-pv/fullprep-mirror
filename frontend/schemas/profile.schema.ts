export interface ProfileInput {
  fullName: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  leetcode?: string;
}

export function validateProfile(data: ProfileInput) {
  const errors: Record<string, string[]> = {};
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = ["Full Name is required."];
  }
  if (!data.username || data.username.trim().length < 3) {
    errors.username = ["Username must be at least 3 characters."];
  }
  if (data.website && !data.website.startsWith("http")) {
    errors.website = ["Website must be a valid URL starting with http:// or https://."];
  }
  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}
