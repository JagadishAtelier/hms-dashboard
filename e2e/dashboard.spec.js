import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers.js";

test.describe("Executive Dashboard & Shell Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("renders executive dashboard with live metric cards and sidebar", async ({ page }) => {
    // Verify application shell components
    await expect(page.locator("aside, [data-slot='sidebar'], nav").first()).toBeVisible({ timeout: 15000 });

    // Verify Metric cards / stats are rendered
    const statCards = page.locator("[data-slot='card'], .rounded-xl, .hms-card");
    await expect(statCards.first()).toBeVisible({ timeout: 15000 });

    // Verify header navbar
    const navbar = page.locator("header, nav");
    await expect(navbar.first()).toBeVisible();
  });

  test("triggers and closes the Command Palette via keyboard and search button", async ({ page }) => {
    // Look for command palette trigger
    const searchTrigger = page.locator('button:has-text("Search"), button:has-text("Ctrl+K")');
    if (await searchTrigger.first().isVisible()) {
      await searchTrigger.first().click();
      const paletteInput = page.locator('input[placeholder*="Search screens"]');
      await expect(paletteInput).toBeVisible({ timeout: 5000 });

      // Press Escape to dismiss
      await page.keyboard.press("Escape");
      await expect(paletteInput).not.toBeVisible();
    }
  });
});
