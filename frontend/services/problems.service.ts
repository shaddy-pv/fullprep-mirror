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

function getStarterCode(slug: string) {
  return {
    javascript: `const fs = require('fs');

function solve() {
    // Read all standard input
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (!input || input.length === 0 || input[0] === "") return;
    
    // Write your code here
    
}

solve();`,
    python: `import sys

def solve():
    # Read all standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        return
        
    # Write your code here
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Write your code here
        
        scanner.close();
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

void solve() {
    // Write your code here
    
}

int main() {
    // Optimize standard I/O operations for speed
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int t = 1;
    // cin >> t;
    while (t--) {
        solve();
    }
    
    return 0;
}`
  };
}

function formatDescription(raw: string): string {
  if (!raw) return "";

  const lines = raw.split('\n');
  const headerStyle = "text-brand-orange text-[13px] font-bold tracking-[0.08em] uppercase border-b border-border-card pb-2 mt-8 mb-4 block w-full";

  let inExamplesSection = false;
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (t === "Example" || t === "Examples") {
      inExamplesSection = true;
      continue;
    }

    if (inExamplesSection) {
      if (t === "Note") {
        inExamplesSection = false;
      } else {
        continue;
      }
    }

    if (t === "Input" || t === "Output" || t === "Note") {
      resultLines.push(`<div class="${headerStyle}">${t}</div>`);
    } else if (t) {
      resultLines.push(`<div class="min-h-[24px]">${line}</div>`);
    } else {
      resultLines.push("<div class='h-4'></div>");
    }
  }

  return resultLines.join('');
}

export const ProblemsService = {
  async getProblems(): Promise<ExtendedProblemItem[]> {
    try {
      const response = await api.get<{ data: any[] }>(`${BASE_URL}/problems?limit=500`);
      if (response && Array.isArray(response.data)) {
        // Deduplicate by title (keep first occurrence)
        const seen = new Set<string>();
        const unique = response.data.filter((prob: any) => {
          const key = (prob.name || "").toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        return unique.map((prob: any, index: number) => {
          const difficulty = mapDifficulty(prob.difficulty);
          const topic = mapTopic(prob.cfTags);
          const acceptance = calculateAcceptance(prob.stats);
          const submissions = formatSubmissions(prob.stats);

          return {
            // Use index+1 as the display number; use _id string as the unique React key base
            id: index + 1,
            _mongoId: prob._id || prob.id || `prob-${index}`,
            title: prob.name,
            status: "pending",
            difficulty,
            topic,
            acceptance,
            tags: prob.cfTags || [],
            frequency: Math.min(10, Math.max(1, Math.round((prob.cfRating || 800) / 250))),
            submissions,
            time: "1 day ago",
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
        const starterCode = getStarterCode(prob.name);

        return {
          slug: prob.externalId,
          title: prob.name,
          difficulty,
          topic,
          tags: prob.cfTags || [],
          description: prob.description ? formatDescription(prob.description) : `<p>${prob.descriptionPreview || ""}</p>`,
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
