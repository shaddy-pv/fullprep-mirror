export const LeaderboardService = {
  async getRankings() {
    return [
      { rank: 1, name: "AlphaCoder", solved: 1420, rating: 2840 },
      { rank: 2, name: "BetaBytes", solved: 1390, rating: 2790 },
      { rank: 3, name: "GammaGo", solved: 1350, rating: 2710 },
    ];
  },
};
