import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProblemsPage } from "./pages/ProblemsPage";

test.describe("Problems Page E2E Tests", () => {
  const signupPassword = "SecurePassword123!";

  test.beforeEach(async ({ page }) => {
    // Generate fresh unique user credentials for each test
    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 5);
    const signupName = `Prob User ${uniqueId}`;
    const signupEmail = `prob_${uniqueId}@fullprep.io`;

    // Signup to access protected routes
    const authPage = new AuthPage(page);
    await authPage.navigateTo("/signup");
    await authPage.fillSignupForm(signupName, signupEmail, signupPassword, signupPassword, true);
    await authPage.submitSignup();

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.navigateToProblems();
    await expect(page).toHaveURL(/.*problems/);
  });

  test("should display problems list and support search", async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    await problemsPage.verifyProblemsCountVisible();

    // Check we have rows in the table
    const rows = await problemsPage.getProblemsList();
    const countBefore = await rows.count();
    expect(countBefore).toBeGreaterThan(0);

    // Search for a specific seeded problem "Luntik"
    await problemsPage.searchProblems("Luntik");
    
    // Check search results
    const filteredRows = await problemsPage.getProblemsList();
    const firstRowText = await filteredRows.first().innerText();
    expect(firstRowText).toContain("Luntik");
  });

  test("should filter by difficulty and topic", async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    
    // Filter by Difficulty: Easy
    await problemsPage.selectDifficulty("Easy");

    // All displayed problems must be Easy (case-insensitive check to support uppercase BADGE styles)
    const rows = await problemsPage.getProblemsList();
    const rowTexts = await rows.allInnerTexts();
    for (const text of rowTexts) {
      if (text.trim() && !text.includes("No problems match")) {
        expect(text.toLowerCase()).toContain("easy");
      }
    }

    // Filter by Topic: Arrays
    await problemsPage.selectTopic("Arrays");

    // Reset filters
    await problemsPage.resetFilters();
    await problemsPage.verifyProblemsCountVisible();
  });

  test("should paginate problems table", async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    await problemsPage.verifyProblemsCountVisible();

    // Scroll down to pagination footer
    const nextBtn = page.locator("button:has(svg.lucide-chevron-right)").first();
    await nextBtn.scrollIntoViewIfNeeded();

    // Go to next page
    await problemsPage.clickNextPage();
    await expect(page).toHaveURL(/.*page=2/);

    // Go back to previous page
    await problemsPage.clickPrevPage();
    await expect(page).toHaveURL(/.*problems/);
  });
});
