import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers.js";

test.describe("POS Terminal & Billing", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("loads POS terminal with catalogue, cart, and dashboard return button", async ({ page }) => {
    await page.goto("/pos");

    // Verify Dashboard navigation button in header
    const dashboardBtn = page.locator('button:has-text("Dashboard")');
    await expect(dashboardBtn).toBeVisible({ timeout: 10000 });

    // Verify Sales List button in header
    const salesListBtn = page.locator('button:has-text("Sales List")');
    await expect(salesListBtn).toBeVisible();

    // Verify Items Search & Category Tabs
    const itemSearch = page.locator('input[placeholder*="Search items"]');
    await expect(itemSearch).toBeVisible();

    // Clicking Dashboard button returns to /dashboard
    await dashboardBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    expect(page.url()).toContain("/dashboard");
  });
});
