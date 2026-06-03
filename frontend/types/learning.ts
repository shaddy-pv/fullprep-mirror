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
  icon: React.ComponentType<{ className?: string }>;
  popularity: number;
  updatedAt: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  iconType: "trophy" | "flame" | "compass";
  colorTheme: "green" | "orange" | "blue";
}
