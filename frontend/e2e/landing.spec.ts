import { test, expect } from "@playwright/test";
import { LandingPage } from "./pages/LandingPage";

test.describe("Landing Page E2E Tests", () => {
  test("should load landing page successfully and toggle theme", async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.navigateTo("/");
    
    // Verify title and main headings
    await landingPage.verifyLandingPageLoaded();

    // Toggle theme
    await landingPage.toggleTheme();

    // Verify navigating to Login
    await landingPage.clickLogin();
    await expect(page).toHaveURL(/.*login/);
  });

  test("should navigate to signup from Get Started", async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.navigateTo("/");
    await landingPage.clickGetStarted();
    await expect(page).toHaveURL(/.*signup/);
  });
});
