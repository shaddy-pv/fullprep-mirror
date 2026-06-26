import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillSignupForm(name: string, email: string, pass: string, confirmPass: string, agree: boolean = true) {
    // Wait for the elements to be visible before filling
    const usernameInput = this.page.locator("input[placeholder='yourusername']");
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill(name);

    const emailInput = this.page.locator("input[placeholder='enter@yourmail.com']").first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill(email);
    
    // Select first and last password inputs to distinguish them
    const passInput = this.page.locator("input[type='password']").first();
    const confirmPassInput = this.page.locator("input[type='password']").last();
    await expect(passInput).toBeVisible();
    await passInput.fill(pass);
    await confirmPassInput.fill(confirmPass);
    
    if (agree) {
      const checkbox = this.page.locator("input[type='checkbox']").first();
      await expect(checkbox).toBeVisible();
      await checkbox.click();
    }
  }

  async submitSignup() {
    const submitBtn = this.page.locator("button[type='submit']");
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
  }

  async fillLoginForm(email: string, pass: string) {
    const emailInput = this.page.locator("#email-input").or(this.page.locator("input[placeholder='enter@yourmail.com']")).first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(email);

    const passInput = this.page.locator("#password-input").or(this.page.locator("input[type='password']")).first();
    await expect(passInput).toBeVisible();
    await passInput.fill(pass);
  }

  async submitLogin() {
    const submitBtn = this.page.locator("button[type='submit']");
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
  }

  async verifyValidationError(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }
}
