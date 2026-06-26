import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";

test.describe("Dashboard Overview E2E Tests", () => {
  const signupPassword = "SecurePassword123!";

  test.beforeEach(async ({ page }) => {
    // Generate fresh unique user credentials for each test
    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 5);
    const signupName = `Dash User ${uniqueId}`;
    const signupEmail = `dash_${uniqueId}@fullprep.io`;

    // Perform signup to be authenticated
    const authPage = new AuthPage(page);
    await authPage.navigateTo("/signup");
    await authPage.fillSignupForm(signupName, signupEmail, signupPassword, signupPassword, true);
    await authPage.submitSignup();

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();
  });

  test("should load overview panels and widgets correctly", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();

    // Verify presence of analytics/problems elements
    await expect(page.locator("text=Problems Solved").first()).toBeVisible();
    await expect(page.locator("text=Streak").first()).toBeVisible();
    await expect(page.locator("text=Recent Problems").first()).toBeVisible();
  });

  test("should navigate to other pages using sidebar links", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();

    // Go to Problems Page
    await dashboardPage.navigateToProblems();
    await expect(page).toHaveURL(/.*problems/);

    // Go to Settings Page
    await dashboardPage.navigateToSettings();
    await expect(page).toHaveURL(/.*settings/);

    // Go to Profile Page
    await dashboardPage.navigateToProfile();
    await expect(page).toHaveURL(/.*profile/);
  });
});
