import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers.js";

test.describe("Doctor Consultation Notes Workspace", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("loads consultation workspace with tabs for encounter, vitals, diagnosis, and prescription", async ({ page }) => {
    await page.goto("/doctor-notes/1");

    // Header check
    await expect(page.locator("h2:has-text('Doctor’s Clinical Consultation'), h2:has-text('Consultation')").first()).toBeVisible({ timeout: 10000 });

    // Verify all 5 clinical tabs exist
    await expect(page.locator("button[role='tab']:has-text('Encounter')")).toBeVisible();
    await expect(page.locator("button[role='tab']:has-text('Vitals')")).toBeVisible();
    await expect(page.locator("button[role='tab']:has-text('Diagnosis')")).toBeVisible();
    await expect(page.locator("button[role='tab']:has-text('Clinical Note')")).toBeVisible();
    await expect(page.locator("button[role='tab']:has-text('Prescriptions')")).toBeVisible();

    // Click Vitals tab and verify fields render
    await page.locator("button[role='tab']:has-text('Vitals')").click();
    await expect(page.locator("input[placeholder*='Height']")).toBeVisible({ timeout: 5000 });
  });
});
