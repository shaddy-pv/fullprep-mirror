import { Page, expect } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string) {
    await this.page.goto(path);
  }

  async getToastMessage() {
    const toastLocator = this.page.locator(".fixed.bottom-6.right-6.z-50");
    await expect(toastLocator).toBeVisible({ timeout: 8000 });
    const msgLocator = toastLocator.locator(".flex-1");
    return await msgLocator.innerText();
  }

  async verifyToast(message: string) {
    const toastLocator = this.page.locator(".fixed.bottom-6.right-6.z-50");
    await expect(toastLocator).toBeVisible({ timeout: 8000 });
    await expect(toastLocator).toContainText(message);
  }
}
