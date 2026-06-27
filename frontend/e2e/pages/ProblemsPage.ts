import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProblemsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async searchProblems(query: string) {
    const searchInput = this.page.locator("input[placeholder='Search problems...']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill(query);
    // Add small delay for search debouncing (300ms + margin)
    await this.page.waitForTimeout(600);
  }

  async selectDifficulty(difficulty: string) {
    const difficultyButton = this.page.locator("button[aria-label^='Difficulty filter:']").first();
    await expect(difficultyButton).toBeVisible();
    await difficultyButton.click();

    const optionButton = this.page.locator(`role=option[name='${difficulty}']`);
    await expect(optionButton).toBeVisible();
    await optionButton.click();
    // Wait for URL update + re-render
    await this.page.waitForTimeout(600);
  }

  async selectTopic(topic: string) {
    const topicButton = this.page.locator("button[aria-label^='Topics filter:']").first();
    await expect(topicButton).toBeVisible();
    await topicButton.click();

    const optionButton = this.page.locator(`role=option[name='${topic}']`);
    await expect(optionButton).toBeVisible();
    await optionButton.click();
    await this.page.waitForTimeout(600);
  }

  async selectStatus(statusLabel: string) {
    const statusButton = this.page.locator("button[aria-label^='Status filter:']").first();
    await expect(statusButton).toBeVisible();
    await statusButton.click();

    const optionButton = this.page.locator(`role=option[name='${statusLabel}']`);
    await expect(optionButton).toBeVisible();
    await optionButton.click();
    await this.page.waitForTimeout(200);
  }

  async selectSortBy(sortLabel: string) {
    const sortButton = this.page.locator("button[aria-label^='Sorting selection:']").first();
    await expect(sortButton).toBeVisible();
    await sortButton.click();

    const optionButton = this.page.locator(`role=option[name='${sortLabel}']`);
    await expect(optionButton).toBeVisible();
    await optionButton.click();
    await this.page.waitForTimeout(200);
  }

  async resetFilters() {
    const resetBtn = this.page.locator("button[aria-label='Reset all search and dropdown filters']");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await this.page.waitForTimeout(300);
  }

  async verifyProblemsCountVisible() {
    await expect(this.page.locator("text=Showing")).toBeVisible();
  }

  async getProblemsList() {
    return this.page.locator("tbody tr");
  }

  async clickProblemRow(title: string) {
    const link = this.page.locator(`tbody tr:has-text("${title}") a[aria-label^="Open "]`).first();
    await expect(link).toBeVisible();
    await link.click();
  }

  async clickNextPage() {
    const nextBtn = this.page.locator("button:has(svg.lucide-chevron-right)").first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await this.page.waitForTimeout(300);
  }

  async clickPrevPage() {
    const prevBtn = this.page.locator("button:has(svg.lucide-chevron-left)").first();
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();
    await this.page.waitForTimeout(300);
  }
}
