import { test, expect } from "@playwright/test";

test.describe("Organization Dashboard", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // ── Page load ────────────────────────────────────────────────────────────────

  test("page loads with correct title and header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Organization" })).toBeVisible();
    await expect(page.getByText("Digital Agent Hierarchy")).toBeVisible();
  });

  test("header shows agent count and live indicator", async ({ page }) => {
    await expect(page.getByText(/1 \/ 1000/)).toBeVisible();
    await expect(page.getByText("Live")).toBeVisible();
    await expect(page.locator("header").getByText("10 levels")).toBeVisible();
  });

  test("legend shows all level and status indicators", async ({ page }) => {
    const legend = page.locator(".flex.items-center.gap-6.px-8.py-3");
    await expect(legend.getByText("Level 1", { exact: true })).toBeVisible();
    await expect(legend.getByText("Level 2", { exact: true })).toBeVisible();
    await expect(legend.getByText("Active", { exact: true })).toBeVisible();
    await expect(legend.getByText("In Meeting", { exact: true })).toBeVisible();
    await expect(legend.getByText("On Leave", { exact: true })).toBeVisible();
  });

  // ── CEO Agent Node ────────────────────────────────────────────────────────────

  test("CEO agent node is visible", async ({ page }) => {
    await expect(page.locator(".text-sm.font-bold", { hasText: "CEO" })).toBeVisible();
    await expect(page.locator(".text-xs.text-zinc-400", { hasText: "Executive" }).first()).toBeVisible();
  });

  // ── Agent Panel ───────────────────────────────────────────────────────────────

  test("agent panel opens by default showing CEO", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Chief Executive Officer & Founder")).toBeVisible();
    await expect(panel.getByRole("button", { name: "overview" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "log" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "conversations" })).toBeVisible();
  });

  test("agent panel shows CEO capabilities", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await expect(panel.getByText("Define and delegate tasks")).toBeAttached();
    await expect(panel.getByText("Make executive decisions")).toBeAttached();
  });

  test("agent panel close button closes the panel", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await expect(panel).toBeVisible();
    await page.getByTestId("close-panel").click();
    await expect(panel).not.toBeVisible();
  });

  test("clicking CEO node re-opens the panel after closing", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await page.getByTestId("close-panel").click();
    await expect(panel).not.toBeVisible();
    await page.locator(".text-sm.font-bold", { hasText: "CEO" }).click();
    await expect(panel).toBeVisible();
  });

  // ── Tabs ──────────────────────────────────────────────────────────────────────

  test("log tab loads and shows CEO init entry", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await panel.getByRole("button", { name: "log" }).click();
    await expect(panel.getByText("init", { exact: true })).toBeVisible();
    await expect(panel.getByText(/Agent initialized/)).toBeVisible();
  });

  test("conversations tab loads and shows empty state", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await panel.getByRole("button", { name: "conversations" }).click();
    await expect(panel.getByText("No conversations yet.")).toBeVisible();
  });

  // ── Status & Emotion Dropdowns ────────────────────────────────────────────────

  test("status dropdown changes CEO status", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await panel.locator("select").first().selectOption("busy");
    await expect(panel.locator("select").first()).toHaveValue("busy");
  });

  test("emotion dropdown changes CEO mood", async ({ page }) => {
    const panel = page.locator("[data-testid='agent-panel']");
    await panel.locator("select").nth(1).selectOption("happy");
    await expect(panel.locator("select").nth(1)).toHaveValue("happy");
  });

  // ── Scrum Panel ───────────────────────────────────────────────────────────────

  test("scrums button opens the scrum panel", async ({ page }) => {
    await page.getByRole("button", { name: /Scrums/ }).click();
    await expect(page.getByText("Scrum Meetings")).toBeVisible();
    await expect(page.getByText("Biweekly · Within-team & cross-team")).toBeVisible();
  });

  test("scrum panel shows scheduled meeting", async ({ page }) => {
    await page.getByRole("button", { name: /Scrums/ }).click();
    await expect(page.getByText("Scheduled")).toBeVisible();
    await expect(page.getByText("2026-04-05")).toBeVisible();
    await expect(page.getByText("Within-Team", { exact: true })).toBeVisible();
  });

  test("scrum panel closes when clicking overlay", async ({ page }) => {
    await page.getByRole("button", { name: /Scrums/ }).click();
    await expect(page.getByText("Scrum Meetings")).toBeVisible();
    await page.mouse.click(100, 300);
    await expect(page.getByText("Scrum Meetings")).not.toBeVisible();
  });

  test("scrum panel closes via its own close button", async ({ page }) => {
    await page.getByRole("button", { name: /Scrums/ }).click();
    await expect(page.getByText("Scrum Meetings")).toBeVisible();
    await page.locator("button", { hasText: "✕" }).last().click();
    await expect(page.getByText("Scrum Meetings")).not.toBeVisible();
  });

  // ── API Route ─────────────────────────────────────────────────────────────────

  test("API returns CEO log and conversations", async ({ page }) => {
    const res = await page.request.get("/api/agent-data/CEO");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("logs");
    expect(body).toHaveProperty("conversations");
    expect(Array.isArray(body.logs)).toBe(true);
    expect(body.logs.length).toBeGreaterThan(0);
    expect(body.logs[0].type).toBe("init");
  });

  // ── Footer ────────────────────────────────────────────────────────────────────

  test("footer is visible", async ({ page }) => {
    await expect(page.getByText("Each agent is a digital human")).toBeVisible();
  });

});
