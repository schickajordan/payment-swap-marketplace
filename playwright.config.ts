import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT_E2E ?? "3321";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * Spins up a production `next start` server, then walks public pages and internal links.
 * First run: `npx playwright install chromium`
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer:
    process.env.PLAYWRIGHT_USE_EXISTING_SERVER ?
      undefined
    : {
        command: `npm run build && npx next start -H 127.0.0.1 -p ${PORT}`,
        url: `${baseURL.replace(/\/$/, "")}/api/health`,
        timeout: 420_000,
        reuseExistingServer: true,
        stdout: "pipe",
        stderr: "pipe",
      },
});
