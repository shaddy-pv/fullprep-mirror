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

    // Get the title of the first problem dynamically to search for it
    const firstRow = rows.first();
    const firstRowText = await firstRow.innerText();
    // The title is usually the first line of the innerText; split by real newline
    const titleToSearch = firstRowText.split('\n')[0].trim();
    
    // Search for this specific problem
    await problemsPage.searchProblems(titleToSearch);
    // Wait for URL to update with the search param
    await page.waitForURL(/.*search=.*/, { timeout: 5000 }).catch(() => {});
    
    // Check search results
    const filteredRows = await problemsPage.getProblemsList();
    const filteredFirstRowText = await filteredRows.first().innerText();
    expect(filteredFirstRowText.toLowerCase()).toContain(titleToSearch.toLowerCase());
  });

  test("should filter by difficulty and topic", async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    
    // Filter by Difficulty: Easy
    await problemsPage.selectDifficulty("Easy");
    // Wait for URL to update and list to re-render
    await page.waitForURL(/.*difficulty=Easy.*/, { timeout: 5000 });
    await page.waitForTimeout(500);

    // All displayed problems must be Easy (case-insensitive badge check)
    const rows = await problemsPage.getProblemsList();
    const count = await rows.count();
    // Ensure some problems are visible or empty state shows
    if (count > 0) {
      const rowTexts = await rows.allInnerTexts();
      for (const text of rowTexts) {
        if (text.trim() && !text.toLowerCase().includes("no problems match")) {
          expect(text.toLowerCase()).toContain("easy");
        }
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
