export type UserRole = "user" | "mentor" | "admin";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    website: string;
  };
  xp: number;
  streak: number;
  level: number;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ProblemSource =
  | "CODEFORCES"
  | "CODECHEF"
  | "HACKEREARTH"
  | "CODEJAM"
  | "ATCODER"
  | "UNKNOWN";

export type ProblemDifficulty =
  | "EASY"
  | "MEDIUM"
  | "HARD"
  | "HARDER"
  | "HARDEST"
  | "EXPERT"
  | "VERY HARD"
  | "UNKNOWN";

export interface AdminProblem {
  _id: string;
  externalId: string;
  serialNo: number;
  name: string;
  description: string;
  descriptionPreview: string;
  source: ProblemSource;
  difficulty: ProblemDifficulty;
  cfRating: number;
  cfTags: string[];
  timeLimitSeconds: number;
  memoryLimitMb: number;
  publicTests: { input: string; output: string; explanation: string }[];
  privateTests: { input: string; output: string; explanation: string }[];
  generatedTests: { input: string; output: string; explanation: string }[];
  solutions: { language: string; solution: string }[];
  incorrectSolutions: { language: string; solution: string }[];
  stats: {
    totalPublicTests: number;
    totalPrivateTests: number;
    totalGeneratedTests: number;
    totalSolutions: number;
    totalIncorrectSolutions: number;
  };
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  notes: string;
  examples: { input: string; output: string; explanation: string }[];
  hints: string[];
  starterCodeTemplates: { language: string; code: string }[];
  editorial: {
    title: string;
    content: string;
    timeComplexity: string;
    spaceComplexity: string;
  } | null;
  judgeConfig: {
    timeLimit: number;
    memoryLimit: number;
    outputMatchingStrategy: string;
  };
  problemCode: string;
  problemSlug: string;
  originalProblemLink: string;
  isActive: boolean;
  createdBy: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionLanguage =
  | "PYTHON3"
  | "CPP17"
  | "CPP20"
  | "JAVA"
  | "JAVASCRIPT"
  | "C"
  | "RUST"
  | "GO";

export type SubmissionStatus =
  | "PENDING"
  | "RUNNING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "SYSTEM_ERROR";

export interface AdminSubmission {
  _id: string;
  user: AdminUser;
  problem: string | null;
  problemExternalId: string;
  problemName: string;
  code: string;
  language: SubmissionLanguage;
  status: SubmissionStatus;
  executionTimeMs: number | null;
  memoryUsedMb: number | null;
  errorMessage: string;
  testCasesPassed: number;
  testCasesTotal: number;
  jobId: string | null;
  createdAt: string;
  updatedAt: string;
}
