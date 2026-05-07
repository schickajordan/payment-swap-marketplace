import { expect, test, type Page } from "@playwright/test";

const SEED_PATHS = [
  "/",
  "/about",
  "/pricing",
  "/demo",
  "/support",
  "/marketplace",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/auth/update-password",
  "/unauthorized",
  "/terms",
  "/privacy",
] as const;

const STATIC_ROUTES = [
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/.well-known/security.txt",
  "/api/health",
] as const;

const PROTECTED_GUEST_PATHS = ["/account", "/seller", "/buyer", "/messages", "/admin"] as const;

function originOf(baseURL: string | undefined): string {
  expect(baseURL).toBeTruthy();
  return new URL(baseURL!).origin;
}

function shouldEnqueueInternalPath(path: string): boolean {
  if (path.startsWith("/api/webhooks")) return false;
  if (path.includes("://")) return false;
  return true;
}

async function collectInternalHrefs(page: Page, origin: string): Promise<string[]> {
  return page.evaluate((o) => {
    const out = new Set<string>();
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const raw = a.getAttribute("href");
      if (!raw) continue;
      if (raw.startsWith("/") && !raw.startsWith("//")) {
        try {
          const u = new URL(raw, o + "/");
          if (u.origin === o) out.add(`${u.pathname}${u.search}${u.hash}`);
        } catch {
          continue;
        }
      } else if (raw.startsWith(`${o}/`)) {
        try {
          const u = new URL(raw);
          out.add(`${u.pathname}${u.search}${u.hash}`);
        } catch {
          continue;
        }
      }
    }
    return [...out];
  }, origin);
}

test.describe("public GET routes", () => {
  test("core pages render", async ({ page, baseURL }) => {
    const origin = originOf(baseURL);
    for (const path of [...SEED_PATHS, ...STATIC_ROUTES]) {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect.soft(res, path).toBeTruthy();
      expect.soft(res!.status(), path).not.toBeGreaterThanOrEqual(500);
      if (path.endsWith(".xml") || path.endsWith(".txt") || path.endsWith(".webmanifest") || path.startsWith("/api/")) {
        continue;
      }
      await expect.soft(page.locator("body"), path).toBeVisible({ timeout: 20_000 });
    }
    // smoke: one page had our app shell
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /Payment Swap Marketplace/i }).first()).toBeVisible();
    expect(origin.length).toBeGreaterThan(10);
  });

  test("protected paths send guests to sign-in (or stay on sign-in)", async ({ page, baseURL }) => {
    originOf(baseURL);
    for (const path of PROTECTED_GUEST_PATHS) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page).toHaveURL(/sign-in/);
    }
  });
});

test.describe("click everything (internal links + safe controls)", () => {
  test("theme toggle on home", async ({ page, baseURL }) => {
    originOf(baseURL);
    await page.goto("/", { waitUntil: "networkidle" });
    const dark = page.getByRole("button", { name: /Switch to dark mode/i });
    const light = page.getByRole("button", { name: /Switch to light mode/i });
    if ((await dark.count()) > 0) {
      await dark.click();
      await expect(light).toBeVisible();
      await light.click();
    }
  });

  test("visit every unique internal href discovered from marketing shells", async ({
    page,
    baseURL,
  }) => {
    const origin = originOf(baseURL);
    const queued = new Set<string>();
    const done = new Set<string>();

    async function visit(href: string) {
      const key = href.split("#")[0]; // de-dupe hash-only variants for load
      if (done.has(key)) return;
      done.add(key);

      const res = await page.goto(href, { waitUntil: "domcontentloaded", timeout: 60_000 });
      expect.soft(res?.status(), href).not.toBeGreaterThanOrEqual(500);

      // Some marketing pages are long; still guarantee something painted.
      await expect(page.locator("body")).toBeVisible({ timeout: 60_000 });

      const next = await collectInternalHrefs(page, origin);
      for (const h of next) {
        if (!h.startsWith("/")) continue;
        if (!shouldEnqueueInternalPath(h)) continue;

        if (!queued.has(h) && done.size + queued.size < 120) {
          queued.add(h);
        }
      }
    }

    for (const seed of SEED_PATHS) {
      await visit(seed);

      while (queued.size > 0) {
        const [nextHref] = [...queued];
        queued.delete(nextHref!);
        if (done.has(nextHref!.split("#")[0])) continue;
        await visit(nextHref!);
      }
    }

    expect(done.size, "clicked through at least a few destinations").toBeGreaterThanOrEqual(SEED_PATHS.length);
  });

  test("sign-in fields accept input (does not submit real auth)", async ({ page, baseURL }) => {
    originOf(baseURL);
    await page.goto("/sign-in", { waitUntil: "networkidle" });
    await page.getByLabel(/^email$/i).fill("ops+smoke@example.com");
    await page.getByLabel(/^password$/i).fill("__smoke_placeholder__");

    await page.goto("/sign-up", { waitUntil: "networkidle" });
    await page.getByLabel(/^email$/i).fill("buyer+smoke@example.com");
    await page.getByLabel(/^password$/i).fill("smokePw12!!");
    await page.getByLabel(/account role/i).selectOption("buyer");

    await page.goto("/forgot-password", { waitUntil: "networkidle" });
    await page.getByLabel(/^email$/i).fill("reset+smoke@example.com");

    expect(true).toBeTruthy();
  });
});
