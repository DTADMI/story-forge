import { test, expect } from "@playwright/test";

// ============================================================================
// Story Forge — E2E Smoke Tests
// ============================================================================

test.describe("StoryForge — Public Pages", () => {
  test("home page loads", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Story/i);
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("StoryForge — Auth Flow", () => {
  test("redirects to signin when accessing dashboard unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("reset password page loads", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("StoryForge — Core Pages (authenticated placeholder)", () => {
  test("dashboard page redirects to auth", async ({ page }) => {
    // Without auth, dashboard should redirect to signin
    await page.goto("/dashboard");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("projects page redirects to auth", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("goals page redirects to auth", async ({ page }) => {
    await page.goto("/goals");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("groups page redirects to auth", async ({ page }) => {
    await page.goto("/groups");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("leaderboard page redirects to auth", async ({ page }) => {
    await page.goto("/leaderboard");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("messages page redirects to auth", async ({ page }) => {
    await page.goto("/messages");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("notifications page redirects to auth", async ({ page }) => {
    await page.goto("/notifications");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("profile page redirects to auth", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("competitions page loads or redirects", async ({ page }) => {
    const response = await page.goto("/competitions");
    // May be public or redirect — either is valid
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("StoryForge — Admin Pages", () => {
  test("admin dashboard redirects to auth", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("admin flags redirects to auth", async ({ page }) => {
    await page.goto("/admin/flags");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });

  test("admin users redirects to auth", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForURL(/\/signin/);
    expect(page.url()).toContain("signin");
  });
});

test.describe("StoryForge — Responsive", () => {
  test("home page at 320px mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    // No horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test("home page at 768px tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("StoryForge — i18n", () => {
  test("home page serves French by default", async ({ page }) => {
    // Set Accept-Language to French
    await page.setExtraHTTPHeaders({ "Accept-Language": "fr" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", /fr/);
  });
});