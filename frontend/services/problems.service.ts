import { api } from "@/lib/api";
import { ExtendedProblemItem } from "@/mocks/problems.mock";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

function mapDifficulty(diff: string): "Easy" | "Medium" | "Hard" {
  const d = String(diff).toUpperCase();
  if (d === "EASY") return "Easy";
  if (d === "MEDIUM") return "Medium";
  return "Hard";
}

function mapTopic(tags: string[]): string {
  if (!tags || tags.length === 0) return "Algorithms";
  const first = tags[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function calculateAcceptance(stats: any): string {
  if (stats && stats.totalSolutions > 0) {
    const correct = stats.totalSolutions - (stats.totalIncorrectSolutions || 0);
    return ((correct / stats.totalSolutions) * 100).toFixed(2) + "%";
  }
  return "76.40%";
}

function formatSubmissions(stats: any): string {
  if (stats && stats.totalSolutions !== undefined) {
    const total = stats.totalSolutions;
    if (total >= 1000) {
      return (total / 1000).toFixed(1) + "K";
    }
    return total.toString();
  }
  return "1.2K";
}

function generateStarterCode(name: string) {
  const cleanName = name.replace(/^\d+_[A-Z]\d*\.\s*/, "");
  const words = cleanName.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const camelName = words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join("");

  return {
    javascript: `/**\n * @return {void}\n */\nvar ${camelName || "solve"} = function() {\n    // Write your code here\n};`,
    python: `class Solution:\n    def ${camelName || "solve"}(self) -> None:\n        # Write your code here\n        pass`,
    java: `class Solution {\n    public void ${camelName || "solve"}() {\n        // Write your code here\n    }\n}`,
    cpp: `class Solution {\npublic:\n    void ${camelName || "solve"}() {\n        // Write your code here\n    }\n};`
  };
}

export const ProblemsService = {
  async getProblems(): Promise<ExtendedProblemItem[]> {
    try {
      const response = await api.get<{ data: any[] }>(`${BASE_URL}/problems?limit=100`);
      if (response && Array.isArray(response.data)) {
        return response.data.map((prob: any) => {
          const difficulty = mapDifficulty(prob.difficulty);
          const topic = mapTopic(prob.cfTags);
          const acceptance = calculateAcceptance(prob.stats);
          const submissions = formatSubmissions(prob.stats);

          return {
            id: prob.serialNo || 1,
            title: prob.name,
            status: "pending",
            difficulty,
            topic,
            acceptance,
            tags: prob.cfTags || [],
            frequency: Math.min(10, Math.max(1, Math.round((prob.cfRating || 800) / 250))),
            submissions,
            time: "1 day ago",
            // Keep the backend ID in custom fields so slug pages can reference it
            externalId: prob.externalId,
          } as any;
        });
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch problems from backend API:", error);
      return [];
    }
  },

  async getProblemBySlug(slug: string): Promise<any> {
    try {
      // The slug matches either the externalId or title slug
      // Let's query by the slug which is the externalId
      const response = await api.get<{ data: any }>(`${BASE_URL}/problems/${slug}`);
      if (response && response.data) {
        const prob = response.data;
        const difficulty = mapDifficulty(prob.difficulty);
        const topic = mapTopic(prob.cfTags);
        const acceptance = calculateAcceptance(prob.stats);
        const submissions = formatSubmissions(prob.stats);
        const starterCode = generateStarterCode(prob.name);

        return {
          slug: prob.externalId,
          title: prob.name,
          difficulty,
          topic,
          tags: prob.cfTags || [],
          description: prob.description || `<p>${prob.descriptionPreview || ""}</p>`,
          examples: (prob.publicTests || []).map((t: any, idx: number) => ({
            input: t.input,
            output: t.output,
            explanation: `Example case #${idx + 1}`
          })),
          constraints: [
            `Time Limit: ${prob.timeLimitSeconds || 2} seconds`,
            `Memory Limit: ${prob.memoryLimitMb || 256} megabytes`,
            `Source: ${prob.source || "CODEFORCES"}`
          ],
          starterCode,
          acceptance,
          submissions,
          upvotes: prob.stats?.totalSolutions || 24,
          downvotes: prob.stats?.totalIncorrectSolutions || 3,
        };
      }
      return undefined;
    } catch (error) {
      console.error(`Failed to fetch problem detail for slug "${slug}":`, error);
      return undefined;
    }
  },

  async getStats(): Promise<any> {
    try {
      const response = await api.get<{ data: any }>(`${BASE_URL}/problems/stats`);
      return response?.data || null;
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      return null;
    }
  },

  async getTags(): Promise<any[]> {
    try {
      const response = await api.get<{ data: { tags: any[] } }>(`${BASE_URL}/problems/tags`);
      return response?.data?.tags || [];
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      return [];
    }
  },
};
