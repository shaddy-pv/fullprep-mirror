import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyDashboardLoaded() {
    // Wait for dashboard content
    await expect(this.page.locator("text=Problems Solved").first()).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator("text=Recent Problems").first()).toBeVisible({ timeout: 15000 });
  }

  async navigateToProblems() {
    await this.page.locator("aside nav a:has-text('Problems')").first().click();
  }

  async navigateToSettings() {
    await this.page.locator("aside nav a:has-text('Settings')").first().click();
  }

  async navigateToProfile() {
    await this.page.locator("aside nav a:has-text('Profile')").first().click();
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
