import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const systemBrowserCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].filter((candidate): candidate is string => Boolean(candidate));
const systemBrowser = systemBrowserCandidates.find((candidate) => existsSync(candidate));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: systemBrowser
          ? {
              executablePath: systemBrowser,
              args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"],
            }
          : {},
      },
    },
  ],
});
