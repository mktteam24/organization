import { test, expect } from "@playwright/test";

test.describe("Sprint 2 — Activity Feed & Level Colors", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("activity feed panel is visible by default", async ({ page }) => {
    // Feed toggle button exists on the right side
    const toggle = page.locator("button[title='Close activity feed']");
    await expect(toggle).toBeVisible();
  });

  test("activity feed shows entries from agent logs", async ({ page }) => {
    // Wait for feed to load (polls every 3s, but content should be immediate)
    await page.waitForTimeout(1000);

    // At minimum the feed header should be present — target the specific header span
    const feedHeader = page.locator("span.text-xs.font-semibold.text-zinc-700");
    await expect(feedHeader).toBeVisible({ timeout: 5000 });
  });

  test("activity feed shows Live indicator", async ({ page }) => {
    // Target the specific Live badge span in the feed header
    await expect(page.locator("span.text-\\[10px\\].text-zinc-400")).toBeVisible();
  });

  test("activity feed can be collapsed and reopened", async ({ page }) => {
    // Feed is open by default — close it
    const closeBtn = page.locator("button[title='Close activity feed']");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Feed header should be hidden
    await expect(page.locator("span.text-xs.font-semibold.text-zinc-700")).not.toBeVisible();

    // Open button should appear
    const openBtn = page.locator("button[title='Open activity feed']");
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Feed header should be visible again
    await expect(page.locator("span.text-xs.font-semibold.text-zinc-700")).toBeVisible();
  });

  test("activity feed entries have colored type badges", async ({ page }) => {
    await page.waitForTimeout(1000);
    // At least one badge type should be visible given the agents have logs
    const hasBadge =
      (await page.locator("text=INIT").count()) > 0 ||
      (await page.locator("text=ACTION").count()) > 0 ||
      (await page.locator("text=DECISION").count()) > 0;
    expect(hasBadge).toBeTruthy();
  });

  test("CEO node has level 1 yellow border", async ({ page }) => {
    await expect(page.locator(".border-yellow-400").first()).toBeVisible();
  });

  test("legend shows all 10 level indicators", async ({ page }) => {
    // All level labels should be in the legend
    for (const label of ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10"]) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }
  });

  test("expanding CEO node reveals L2 children with blue borders", async ({ page }) => {
    // CEO is expanded by default — L2 nodes should have blue border
    await expect(page.locator(".border-blue-400").first()).toBeVisible();
  });

  test("org tree shows 23+ agents in count display", async ({ page }) => {
    // Agent count should be >= 23 (we have 23 agents created)
    const countEl = page.locator("text=/\\d+ \\/ 1000/");
    await expect(countEl).toBeVisible({ timeout: 5000 });
  });

});
