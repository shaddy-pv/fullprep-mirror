import { STREAK_DAYS } from "@/mocks/profile.mock";

export const ProfileService = {
  async getStreak() {
    return STREAK_DAYS;
  },
};
