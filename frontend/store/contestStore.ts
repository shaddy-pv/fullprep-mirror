import { create } from "zustand";

interface ContestState {
  activeContestsCount: number;
}

export const useContestStore = create<ContestState>(() => ({
  activeContestsCount: 0,
}));
