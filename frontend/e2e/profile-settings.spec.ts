import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import * as path from "path";

test.describe("Profile and Settings E2E Tests", () => {
  const signupPassword = "SecurePassword123!";

  test.beforeEach(async ({ page }) => {
    // Generate fresh credentials for each test to avoid local db duplicate email conflicts
    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 5);
    const signupName = `Settings User ${uniqueId}`;
    const signupEmail = `settings_${uniqueId}@fullprep.io`;

    // Signup to access settings
    const authPage = new AuthPage(page);
    await authPage.navigateTo("/signup");
    await authPage.fillSignupForm(signupName, signupEmail, signupPassword, signupPassword, true);
    await authPage.submitSignup();

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.navigateToSettings();
    await expect(page).toHaveURL(/.*settings/);
  });

  test("should update profile details, social links, and save successfully", async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const uniqueVal = Date.now().toString().substr(-4);

    // Fill profile fields
    const newName = `Updated Name ${uniqueVal}`;
    const newBio = "Passionate developer building automation test suites.";
    const newLocation = "San Francisco, CA";
    const newWebsite = "https://fullprep.io";

    await settingsPage.fillProfileInfo(newName, newBio, newLocation, newWebsite);

    // Fill a social link
    await settingsPage.fillSocialLink("GitHub", "test-github-user");
    await settingsPage.fillSocialLink("LeetCode", "test-leetcode-user");

    // Click Save Changes
    await settingsPage.clickSaveChanges();

    // Verify success toast
    await settingsPage.verifyToast("Changes saved successfully to your FullPrep profile!");
  });

  test("should support avatar image upload and compress it", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    // Locate sample image in workspace
    const imagePath = path.resolve("d:/Projects/fullprep-mirror/photos/Screenshot 2026-06-16 000715.png");

    // Trigger upload
    await settingsPage.uploadAvatar(imagePath);

    // Verify upload toast message
    await settingsPage.verifyToast("Avatar updated successfully!");
  });

  test("should change user password successfully", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    // Switch to Account Settings Tab
    await settingsPage.selectTab("Account Settings");

    // Fill in passwords
    const newPassword = "BrandNewPassword123!";
    await settingsPage.fillPasswordForm(signupPassword, newPassword, newPassword);

    // Submit password update
    await settingsPage.clickChangePassword();

    // Verify password updated toast
    await settingsPage.verifyToast("Password updated successfully!");
  });
});
