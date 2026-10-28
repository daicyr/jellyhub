import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 3100);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("E2E_PORT must be a valid TCP port");
}

const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: "setup.e2e.ts",
      retries: 0,
    },
    {
      name: "chromium",
      testMatch: "auth.e2e.ts",
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "bun --no-env-file tests/e2e-server.ts",
    url: `${baseURL}/api/auth/ok`,
    env: { E2E_PORT: String(port) },
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 15_000 },
  },
});
