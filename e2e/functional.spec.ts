import { test, expect } from "@playwright/test";

test.describe("Functional Verification", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("changing status updates the CEO card dot color", async ({ page }) => {
    // Initial state: active = emerald dot
    const dot = page.locator(".bg-emerald-500").first();
    await expect(dot).toBeVisible();

    // Change to busy
    const panel = page.locator("[data-testid='agent-panel']");
    await panel.locator("select").first().selectOption("busy");

    // Dot should now be orange (busy)
    await expect(page.locator(".bg-orange-400").first()).toBeVisible();
    // Emerald dot should be gone from the card
    await expect(page.locator(".text-sm.font-bold", { hasText: "CEO" })
      .locator("..").locator(".bg-emerald-500")).not.toBeVisible();
  });

  test("changing emotion updates the CEO card emoji", async ({ page }) => {
    // Initial state: focused = 🎯
    await expect(page.locator("text=🎯").first()).toBeVisible();

    const panel = page.locator("[data-testid='agent-panel']");
    await panel.locator("select").nth(1).selectOption("happy");

    // Emoji should now be 😊
    await expect(page.locator("text=😊").first()).toBeVisible();
    await expect(page.locator("text=🎯").first()).not.toBeVisible();
  });

  test("status label in card updates when dropdown changes", async ({ page }) => {
    const card = page.locator(".text-sm.font-bold", { hasText: "CEO" }).locator("..");
    await expect(card.getByText("Active")).toBeVisible();

    await page.locator("[data-testid='agent-panel']").locator("select").first().selectOption("in-meeting");
    await expect(card.getByText("In Meeting")).toBeVisible();
  });

  test("log tab shows spinner then content", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await panel.getByRole("button", { name: "log" }).click();

    // Should eventually show the init log entry (spinner disappears)
    await expect(panel.getByText("init", { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(panel.getByText(/Agent initialized/)).toBeVisible();
    await expect(panel.locator(".animate-spin")).not.toBeVisible();
  });

  test("conversations tab shows empty state", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await panel.getByRole("button", { name: "conversations" }).click();

    await expect(panel.getByText("No conversations yet.")).toBeVisible({ timeout: 5000 });
    await expect(panel.locator(".animate-spin")).not.toBeVisible();
  });

  test("switching tabs resets to overview correctly", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");

    await panel.getByRole("button", { name: "log" }).click();
    await expect(panel.getByText("init", { exact: true })).toBeVisible();

    await panel.getByRole("button", { name: "overview" }).click();
    await expect(panel.locator("select").first()).toBeVisible();
    await expect(panel.getByText("init", { exact: true })).not.toBeVisible();
  });

  test("close panel hides it and CEO card stays in org chart", async ({ page }) => {
    await page.getByTestId("close-panel").click();
    await expect(page.locator("[data-testid='agent-panel']")).not.toBeVisible();
    // CEO card still visible in org chart
    await expect(page.locator(".text-sm.font-bold", { hasText: "CEO" })).toBeVisible();
  });

  test("re-opening panel after close restores overview tab", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");

    // Switch to log tab
    await panel.getByRole("button", { name: "log" }).click();

    // Close and re-open
    await page.getByTestId("close-panel").click();
    await page.locator(".text-sm.font-bold", { hasText: "CEO" }).click();

    // Should be back on overview tab
    await expect(panel.locator("select").first()).toBeVisible();
  });

  test("scrum panel shows correct meeting details", async ({ page }) => {
    await page.getByRole("button", { name: /Scrums/ }).click();
    await expect(page.getByText("Scrum Meetings")).toBeVisible();
    await expect(page.getByText("2026-04-05")).toBeVisible();
    await expect(page.getByText("No past scrums recorded.")).toBeVisible();
    // Verify participant shown
    await expect(page.locator(".rounded-xl.border").filter({ hasText: "2026-04-05" }).getByText("CEO")).toBeVisible();
  });

  test("agent count progress bar is rendered with correct color for below-range", async ({ page }) => {
    // 1 agent is below 1000, so bar should be amber
    await expect(page.locator(".bg-amber-400")).toBeVisible();
    await expect(page.locator(".text-amber-500")).toBeVisible();
  });

  test("breadcrumb shows root message for CEO", async ({ page }) => {
    await expect(page.locator("[data-testid='agent-panel']").getByText("Root — no reports-to chain")).toBeVisible();
  });

  test("level 1 border color is yellow on CEO card", async ({ page }) => {
    await expect(page.locator(".border-yellow-400").first()).toBeVisible();
  });

});
