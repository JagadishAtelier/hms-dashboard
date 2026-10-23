/**
 * Reusable test helpers for Playwright E2E suites
 */
export async function loginAsAdmin(page) {
  await page.goto("/login");

  // If already redirected to dashboard, no need to fill form
  if (page.url().includes("/dashboard")) {
    return;
  }

  const identifierInput = page.locator('#login-identifier, input[name="identifier"]');
  const passwordInput = page.locator('#login-password, input[name="password"]');
  const submitBtn = page.locator('button[type="submit"]');

  await identifierInput.waitFor({ state: "visible", timeout: 10000 });
  await identifierInput.fill("admin@gmail.com");
  await passwordInput.fill("Admin@123");
  await submitBtn.click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });
}
