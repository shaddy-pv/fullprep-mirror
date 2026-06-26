import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LandingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyLandingPageLoaded() {
    await expect(this.page).toHaveTitle(/FullPrep/i);
    // Verify landing sections exist
    await expect(this.page.locator("text=Ready to level up your coding skills?")).toBeVisible();
    await expect(this.page.locator("text=Why FullPrep").first()).toBeVisible();
  }

  async toggleTheme() {
    const themeButton = this.page.locator("button[aria-label='Toggle theme']").first();
    await expect(themeButton).toBeVisible();
    await themeButton.click();
  }

  async clickLogin() {
    await this.page.locator("a:has-text('Log In')").first().click();
  }

  async clickGetStarted() {
    await this.page.locator("a:has-text('Get Started')").first().click();
  }
}
