export interface ProblemItem {
  id: number;
  title: string;
  status: "completed" | "pending";
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  time: string;
}

export interface ExtendedProblemItem extends ProblemItem {
  acceptance: string;
  tags: string[];
  frequency: number; // Scale of 1 to 10
  submissions: string;
}

export interface MockProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface MockProblem {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  tags: string[];
  description: string;
  examples: MockProblemExample[];
  constraints: string[];
  starterCode: Record<string, string>;
  acceptance: string;
  submissions: string;
  upvotes: number;
  downvotes: number;
}
