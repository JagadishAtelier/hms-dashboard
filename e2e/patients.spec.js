import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers.js";

test.describe("Patient Directory & Records", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("loads patient directory with table, search, and action buttons", async ({ page }) => {
    await page.goto("/patient-list");

    // Search bar presence
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // Table or list presence
    const tableOrCards = page.locator("table, article");
    await expect(tableOrCards.first()).toBeVisible({ timeout: 15000 });

    // Add Patient button
    const addPatientBtn = page.locator('button:has-text("Add Patient"), a:has-text("Add Patient")');
    await expect(addPatientBtn.first()).toBeVisible({ timeout: 10000 });
  });
});
