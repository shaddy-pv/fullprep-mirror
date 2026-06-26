import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";


test.describe("Authentication E2E Tests", () => {
  const uniqueId = Date.now();
  const signupName = `User ${uniqueId}`;
  const signupEmail = `e2e_${uniqueId}@fullprep.io`;
  const signupPassword = "SecurePassword123!";

  test("should show errors for invalid signup input", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.navigateTo("/signup");

    // Use an email format that passes browser native input validation (has '@')
    // but fails our custom regex validation (missing extension dot)
    await authPage.fillSignupForm("u", "invalid-email@example", "short", "mismatch", false);
    await authPage.submitSignup();

    // Verify custom validation error messages are displayed
    await authPage.verifyValidationError("Username must be at least 3 characters");
    await authPage.verifyValidationError("Please enter a valid email address");
    await authPage.verifyValidationError("Password must be at least 8 characters");
    await authPage.verifyValidationError("Passwords do not match");
  });

  test("should sign up a new user, log out, and log back in successfully", async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Sign Up
    await authPage.navigateTo("/signup");
    await authPage.fillSignupForm(signupName, signupEmail, signupPassword, signupPassword, true);
    await authPage.submitSignup();

    // Verification of registration success / dashboard load
    await dashboardPage.verifyDashboardLoaded();

    // 2. Log Out
    await dashboardPage.logout();

    // Verify redirected back to login page (actual application behavior)
    await expect(page).toHaveURL(/.*login/);

    // 3. Log In with same credentials
    await authPage.fillLoginForm(signupEmail, signupPassword);
    await authPage.submitLogin();

    // Verify dashboard loads again
    await dashboardPage.verifyDashboardLoaded();
  });

  test("should support forgot password flow validation and request submission", async ({ page }) => {
    await page.goto("/forgot-password");

    // Invalid email validation
    const emailInput = page.locator("input[placeholder='enter@yourmail.com']");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("invalid-email@example");
    
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();
    await expect(page.locator("text=Please enter a valid email address")).toBeVisible();

    // Valid email submission
    await emailInput.fill("forgot_password_test@fullprep.io");
    await submitBtn.click();

    // Verify success notification block
    await expect(page.locator("text=Check your inbox").first()).toBeVisible({ timeout: 10000 });
  });
});
