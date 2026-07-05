import React from "react";

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  problemsCount: number;
  topicsCount: number;
  estimatedTime: string;
  color: string;
  icon: string | React.ComponentType<{ className?: string }>;
  popularity: number;
  updatedAt: string | number;
  isPro?: boolean;
  isEnrolled?: boolean;
  solvedCount?: number;
  contentType?: "problems" | "notes";
  content?: string;
  modules?: Array<{
    _id?: string;
    title: string;
    description: string;
    problems: Array<{
      externalId: string;
      title: string;
      difficulty: string;
      acceptanceRate: number;
      tags: string[];
      status: "SOLVED" | "UNSOLVED";
    }>;
  }>;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  iconType: "trophy" | "flame" | "compass";
  colorTheme: "green" | "orange" | "blue";
}
