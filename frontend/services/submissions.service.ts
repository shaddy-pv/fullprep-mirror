export const SubmissionsService = {
  async getSubmissions() {
    return [
      { id: "s1", problemId: 1, language: "cpp", status: "Accepted", time: "1 hour ago" },
      { id: "s2", problemId: 2, language: "python", status: "Pending", time: "3 hours ago" },
    ];
  },
};
