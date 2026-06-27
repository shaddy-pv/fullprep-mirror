import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyDashboardLoaded() {
    // Wait for any dashboard-specific content to appear
    const dashboardContent = this.page
      .locator("text=Problems Solved")
      .or(this.page.locator("text=Recent Problems"))
      .or(this.page.locator("text=Welcome"));
    await expect(dashboardContent.first()).toBeVisible({ timeout: 15000 });
  }

  async navigateToProblems() {
    // Use href attribute for reliable matching instead of text (avoids ambiguous matches)
    await this.page.locator("aside nav a[href='/problems']").first().click();
    await this.page.waitForURL(/.*problems.*/, { timeout: 10000 });
  }

  async navigateToSettings() {
    await this.page.locator("aside nav a[href='/settings']").first().click();
    await this.page.waitForTimeout(300); // Allow Next.js router to process
  }

  async navigateToProfile() {
    await this.page.locator("aside nav a[href='/profile']").first().click();
    await this.page.waitForTimeout(300); // Allow Next.js router to process
  }

  async logout() {
    // Click bottom profile card to toggle the mini panel popover
    const profileCard = this.page.locator("aside div.flex-none div.cursor-pointer").first();
    await expect(profileCard).toBeVisible({ timeout: 5000 });
    await profileCard.click();
    await this.page.waitForTimeout(400);

    // Click Sign Out button inside the popover
    const signOutBtn = this.page.locator("button:has-text('Sign Out')").first();
    await expect(signOutBtn).toBeVisible({ timeout: 5000 });
    await signOutBtn.click();
    await this.page.waitForTimeout(500);
  }
}
