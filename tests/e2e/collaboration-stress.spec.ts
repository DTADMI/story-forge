// =============================================================================
// StoryForge — Yjs Collaboration Stress Test
// Verifies real-time sync under concurrent edits from multiple simulated users.
// =============================================================================

import { test, expect } from '@playwright/test';

// Use shared auth state from global setup
test.use({ storageState: 'e2e/.auth/storage-state.json' });

const STRESS_USERS = 3;
const CONCURRENT_EDITS = 20;

test.describe('Yjs Collaboration Stress Test', () => {
  test('should sync concurrent text edits across multiple users', async ({ browser }) => {

    const contexts = await Promise.all(
      Array.from({ length: STRESS_USERS }, () => browser.newContext()),
    );
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    // All users navigate to the same project
    const projectUrl = `${process.env.TEST_PROJECT_URL || 'http://localhost:3000/projects/test-collab'}`;
    await Promise.all(pages.map(p => p.goto(projectUrl)));

    // Wait for Yjs connection indicators
    await Promise.all(pages.map(async (p, i) => {
      await p.waitForSelector('[data-testid="connection-status"], .peer-connected', { timeout: 5000 }).catch(() => {});
    }));

    // Each user makes concurrent edits
    const editPromises = pages.map(async (page, userIndex) => {
      const editor = page.locator('[contenteditable], .ProseMirror, textarea').first();

      for (let i = 0; i < CONCURRENT_EDITS; i++) {
        await editor.click();
        await page.keyboard.type(`User${userIndex + 1}-msg${i + 1} `);
        // Small delay to simulate human typing
        await page.waitForTimeout(50 + Math.random() * 100);
      }
    });

    await Promise.all(editPromises);

    // Wait for Yjs sync to settle
    await page.waitForTimeout(3000);

    // Verify all pages show consistent content
    const contents = await Promise.all(
      pages.map(async p => {
        const editor = p.locator('[contenteditable], .ProseMirror, textarea').first();
        return editor.textContent();
      }),
    );

    // All users should see the same combined text
    const uniqueContent = new Set(contents.filter(Boolean));
    console.log(`Unique content states after sync: ${uniqueContent.size}`);
    expect(uniqueContent.size).toBe(1);

    // Verify that each user's edits are present
    const combinedText = [...uniqueContent][0] || '';
    for (let u = 1; u <= STRESS_USERS; u++) {
      expect(combinedText).toContain(`User${u}`);
    }

    await Promise.all(contexts.map(ctx => ctx.close()));
  });

  test('should handle user disconnect and reconnect', async ({ browser }) => {

    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    const url = `${process.env.TEST_PROJECT_URL || 'http://localhost:3000/projects/test-collab'}`;
    await page1.goto(url);
    await page2.goto(url);

    // User 1 types
    const editor1 = page1.locator('[contenteditable], .ProseMirror, textarea').first();
    await editor1.click();
    await page1.keyboard.type('Hello from User 1. ');

    // User 2 verifies it appears
    await page1.waitForTimeout(1500);
    const editor2 = page2.locator('[contenteditable], .ProseMirror, textarea').first();
    const contentAfterType = await editor2.textContent();
    expect(contentAfterType).toContain('Hello from User 1');

    // User 2 disconnects (close context)
    await ctx2.close();

    // User 1 types more
    await editor1.click();
    await page1.keyboard.type('More text while alone. ');

    // User 2 reconnects (new context)
    const ctx2b = await browser.newContext();
    const page2b = await ctx2b.newPage();
    await page2b.goto(url);
    await page1.waitForTimeout(2000);

    // User 2 should see the text User 1 typed while they were away
    const editor2b = page2b.locator('[contenteditable], .ProseMirror, textarea').first();
    const contentAfterReconnect = await editor2b.textContent();
    expect(contentAfterReconnect).toContain('More text while alone');

    await ctx1.close();
    await ctx2b.close();
  });
});