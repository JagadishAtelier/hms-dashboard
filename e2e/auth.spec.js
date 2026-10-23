import { test, expect } from "@playwright/test";

test.describe("Authentication Workflows", () => {
  test("renders login page with email and password fields", async ({ page }) => {
    await page.goto("/login");

    // Title / branding verification
    await expect(page).toHaveTitle(/Hospital Management|Atelier|Login/i);

    // Form input presence
    const emailInput = page.locator('#login-identifier, input[name="identifier"]');
    const passwordInput = page.locator('#login-password, input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.locator('#login-identifier, input[name="identifier"]');
    const passwordInput = page.locator('#login-password, input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill("admin@gmail.com");
    await passwordInput.fill("Admin@123");
    await submitBtn.click();

    // Verify redirected to /dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });
});
