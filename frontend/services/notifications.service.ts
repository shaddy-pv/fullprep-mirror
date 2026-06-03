export const NotificationsService = {
  async getNotifications() {
    return [
      { id: "1", type: "achievement", title: "New Badge Unlocked", description: "DSA Pioneer" },
    ];
  },
};
