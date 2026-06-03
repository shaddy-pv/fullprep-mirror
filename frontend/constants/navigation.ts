import { 
  Home, 
  Code2, 
  Compass, 
  Zap, 
  Sparkles, 
  Trophy, 
  FileCheck2, 
  User2, 
  Bookmark,
  Settings 
} from "lucide-react";
import { NavigationItem, ProblemItem } from "@/types/dashboard";

// Structured Sidebar Menu Items with corresponding Next.js routes
export const SIDEBAR_MENU_ITEMS = [
  { name: "Overview", icon: Home, badge: null, href: "/" },
  { name: "Problems", icon: Code2, badge: null, href: "/problems" },
  { name: "Learning Paths", icon: Compass, badge: null, href: "/learning-paths" },
  { name: "Contests", icon: Zap, badge: null, href: "/contests" },
  { name: "AI Hints", icon: Sparkles, badge: "AI", href: "/ai-hints" },
  { name: "Leaderboard", icon: Trophy, badge: null, href: "/leaderboard" },
  { name: "Submissions", icon: FileCheck2, badge: null, href: "/submissions" },
  { name: "Profile", icon: User2, badge: null, href: "/profile" },
  { name: "Bookmarks", icon: Bookmark, badge: null, href: "/bookmarks" },
  { name: "Settings", icon: Settings, badge: null, href: "/settings" },
];

export { STREAK_DAYS } from "@/mocks/profile.mock";
export { 
  PROBLEMS_LIST_MOCK, 
  TOPICS_MOCK_DATA, 
  TOP_TAGS_MOCK_DATA, 
  PROBLEMS_MOCK_DATA 
} from "@/mocks/problems.mock";
export type { ExtendedProblemItem } from "@/mocks/problems.mock";
export { CHART_MOCK_DATA, DIFFICULTY_PIE_DATA } from "@/mocks/contests.mock";

