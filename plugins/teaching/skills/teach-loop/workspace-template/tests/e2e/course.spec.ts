import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const workspace = JSON.parse(readFileSync(path.resolve(".teach-loop.json"), "utf8"));
const appHtml = readFileSync(path.resolve("built-lessons", `${workspace.courseId}-course.html`), "utf8");

async function loadApp(page: import("@playwright/test").Page) {
  await page.setContent(appHtml, { waitUntil: "load" });
  await page.waitForSelector("h1");
}

test("orientation lesson captures a note and includes it in the tutor return", async ({ page }) => {
  await loadApp(page);
  await expect(page).toHaveTitle(/Set the tutor's compass/);
  await expect(page.getByRole("heading", { name: "Set the tutor's compass", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Add a note about Name the change you want" }).click();
  await expect(page.getByTestId("desktop-notes-dock")).toHaveAttribute("data-state", "open");
  await page.locator("#desktop-new-anchored-note").fill("I want examples connected to a real project.");
  await page.getByRole("button", { name: "Save anchored note" }).click();
  await page.getByRole("button", { name: "Collapse notes" }).click();

  await page.getByLabel("Your prediction").fill("I want to ship a small working artifact.");
  await page.getByRole("button", { name: "Lock prediction" }).click();

  await page.getByRole("button", { name: "Return to tutor" }).last().click();
  const markdown = page.getByLabel("Markdown tutor return");
  await expect(markdown).toHaveValue(/I want examples connected to a real project\./);
  await expect(markdown).toHaveValue(/I want to ship a small working artifact\./);
});

test("theme controls support dark mode", async ({ page }) => {
  await loadApp(page);
  await page.getByRole("button", { name: "Theme and reading settings" }).click();
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("portable course renders without application console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await loadApp(page);
  await expect(page.getByRole("heading", { name: "Set the tutor's compass", level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("lesson progress rail expands and tracks the current section", async ({ page }) => {
  await loadApp(page);
  const rail = page.getByTestId("lesson-progress-rail");
  await expect(rail).toHaveAttribute("data-state", "collapsed");
  await page.getByRole("button", { name: "Expand lesson progress" }).click();
  await expect(rail).toHaveAttribute("data-state", "expanded");

  await page.locator("#constraints").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(page.locator('[data-section-id="constraints"]')).toHaveAttribute("aria-current", "step");
});

test("desktop notes dock remains reachable and collapsible", async ({ page }) => {
  await loadApp(page);
  const dock = page.getByTestId("desktop-notes-dock");
  await expect(dock).toHaveAttribute("data-state", "collapsed");
  await page.getByRole("button", { name: "Expand lesson notes" }).click();
  await expect(dock).toHaveAttribute("data-state", "open");
  await expect(page.locator("#desktop-new-anchored-note")).toBeVisible();
  await page.getByRole("button", { name: "Collapse notes" }).click();
  await expect(dock).toHaveAttribute("data-state", "collapsed");
});

test("return packet actions stay visible at a short viewport height", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 600 });
  await loadApp(page);
  await page.getByRole("button", { name: "Return to tutor" }).last().click();

  const actions = page.getByTestId("export-dialog-actions");
  await expect(actions).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy tutor prompt" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Markdown" })).toBeVisible();
  await expect(page.getByRole("button", { name: "JSON" })).toBeVisible();
  const box = await actions.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? 1000) + (box?.height ?? 1000)).toBeLessThanOrEqual(600);
});

test("mobile uses a reachable notes sheet and top progress strip", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadApp(page);
  await page.getByRole("button", { name: "Open lesson notes" }).click();
  await expect(page.locator("#mobile-new-anchored-note")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("top-reading-progress")).toBeVisible();
});
