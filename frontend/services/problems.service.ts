import { PROBLEMS_LIST_MOCK, ExtendedProblemItem } from "@/mocks/problems.mock";

export const ProblemsService = {
  async getProblems(): Promise<ExtendedProblemItem[]> {
    return PROBLEMS_LIST_MOCK;
  },

  async getProblemBySlug(slug: string): Promise<ExtendedProblemItem | undefined> {
    return PROBLEMS_LIST_MOCK.find(
      (p) => p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === slug
    );
  },
};
