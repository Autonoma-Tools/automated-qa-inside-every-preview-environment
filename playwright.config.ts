import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for running E2E tests against per-PR preview
 * environments. The base URL is injected at runtime via PLAYWRIGHT_BASE_URL,
 * which is set by the GitHub Actions workflow after the preview deployment
 * job emits its dynamic preview URL.
 *
 * The PREVIEW_BYPASS_TOKEN header pattern lets test traffic skip whatever
 * access-control layer the preview platform places in front of the app
 * (Vercel password protection, Cloudflare Access, a custom auth proxy, etc.).
 * Implement the token check inside your app's auth middleware so it is only
 * honored on preview deployments, never on production.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const BYPASS_TOKEN = process.env.PREVIEW_BYPASS_TOKEN ?? "";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: BYPASS_TOKEN
      ? { "x-preview-bypass-token": BYPASS_TOKEN }
      : {},
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
