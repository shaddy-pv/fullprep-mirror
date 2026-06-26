import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async selectTab(tabName: string) {
    const tabButton = this.page.locator(`button:has-text("${tabName}")`).first();
    await expect(tabButton).toBeVisible();
    await tabButton.click();
    await this.page.waitForTimeout(400); // Allow time for tab transition animation
  }

  async fillProfileInfo(name: string, bio: string, location: string, website: string) {
    const nameInput = this.page.locator("input[placeholder='Your name']");
    const bioTextarea = this.page.locator("textarea[placeholder='Write a brief profile description...']");
    const locationInput = this.page.locator("input[placeholder='e.g., India']");
    const websiteInput = this.page.locator("input[placeholder='e.g., https://yourwebsite.dev']");

    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
    await bioTextarea.fill(bio);
    await locationInput.fill(location);
    await websiteInput.fill(website);
  }

  async fillSocialLink(platform: "GitHub" | "LinkedIn" | "Twitter/X" | "LeetCode", username: string) {
    // Find the exact label span
    const span = this.page.locator("span").filter({ hasText: platform }).first();
    // Locate the innermost parent div containing the span
    const container = this.page.locator("div").filter({ has: span }).last();
    const input = container.locator("input[type='text']");
    await expect(input).toBeVisible();
    await input.fill(username);
  }

  async clickSaveChanges() {
    const saveBtn = this.page.locator("button:has-text('Save Changes')").first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
  }

  async fillPasswordForm(currentPass: string, newPass: string, confirmPass: string) {
    const currentInput = this.page.locator("input[type='password']").nth(0);
    const newInput = this.page.locator("input[type='password']").nth(1);
    const confirmInput = this.page.locator("input[type='password']").nth(2);

    await expect(currentInput).toBeVisible();
    await currentInput.fill(currentPass);
    await newInput.fill(newPass);
    await confirmInput.fill(confirmPass);
  }

  async clickChangePassword() {
    const changeBtn = this.page.locator("button:has-text('Change Password')").first();
    await expect(changeBtn).toBeVisible();
    await changeBtn.click();
  }

  async uploadAvatar(filePath: string) {
    const fileInput = this.page.locator("input[type='file'][accept='image/*']");
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000); // Wait for compression / upload processing
  }
}
