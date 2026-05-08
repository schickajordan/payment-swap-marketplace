import { expect, test } from "@playwright/test";

test.describe("primary marketing CTAs", () => {
  test("home hero paths reach marketplace or auth without 5xx", async ({ page, baseURL }) => {
    expect(baseURL).toBeTruthy();
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const marketplace = page.getByRole("link", { name: /browse swap listings/i }).first();
    await expect(marketplace).toBeVisible({ timeout: 20_000 });
    const mpRes = await marketplace.evaluate((el) => {
      const a = el.closest("a");
      return a?.getAttribute("href") ?? "";
    });
    expect(mpRes).toMatch(/^\/?marketplace/);
    const mpGo = await page.goto(new URL(mpRes, baseURL!).toString(), { waitUntil: "domcontentloaded" });
    expect(mpGo?.status()).not.toBeGreaterThanOrEqual(500);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const signUp = page.getByRole("link", { name: /create account|register your business/i }).first();
    await expect(signUp).toBeVisible({ timeout: 15_000 });
    await signUp.click();
    await expect(page).toHaveURL(/sign-up/);
    await expect(page.getByRole("heading", { name: /business account/i })).toBeVisible();
  });

  test("pricing and support pages expose primary CTA to marketplace", async ({ page, baseURL }) => {
    expect(baseURL).toBeTruthy();
    for (const path of ["/pricing", "/support"] as const) {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect.soft(res?.status(), path).not.toBeGreaterThanOrEqual(500);
      const toInventory = page.getByRole("link", { name: /enter marketplace|all inventory/i }).first();
      await expect(toInventory).toBeVisible({ timeout: 20_000 });
      const href = await toInventory.evaluate((el) => {
        const a = el.closest("a");
        return a?.getAttribute("href") ?? "";
      });
      expect(href).toMatch(/marketplace/);
    }
  });

  test("legal pages use app shell and show version metadata", async ({ page }) => {
    await page.goto("/terms", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("navigation", { name: /shop by category/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /terms of service/i })).toBeVisible();
    await expect(page.getByText(/version/i)).toBeVisible();

    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();
  });
});
