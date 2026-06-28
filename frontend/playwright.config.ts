import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  timeout: 60000,
  testDir: "./e2e",
  /* Run tests sequentially (1 worker) to prevent DB record collisions on signups/settings updates */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"]
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
