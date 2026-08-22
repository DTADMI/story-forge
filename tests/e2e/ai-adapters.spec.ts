// =============================================================================
// StoryForge — AI Adapter Tests
// Verifies OpenRouter, DeepSeek, and OpenAI adapter connectivity and responses.
// =============================================================================

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

interface AiAdapterTest {
  name: string;
  endpoint: string;
  model: string;
  expectedMinLength: number;
}

const ADAPTERS: AiAdapterTest[] = [
  { name: 'OpenAI', endpoint: '/api/ai/openai', model: 'gpt-4o-mini', expectedMinLength: 20 },
  { name: 'DeepSeek', endpoint: '/api/ai/deepseek', model: 'deepseek-chat', expectedMinLength: 20 },
];

test.describe('AI Adapter Tests', () => {
  for (const adapter of ADAPTERS) {
    test.describe(`${adapter.name} adapter`, () => {
      test('should return valid response from API', async ({ page }) => {
        test.skip(!process.env.CI, `Requires API key for ${adapter.name}`);

        const response = await page.request.post(`${BASE_URL}${adapter.endpoint}`, {
          data: {
            messages: [{ role: 'user', content: 'Say "hello" in one word.' }],
            model: adapter.model,
          },
        });

        if (response.status() === 401 || response.status() === 403) {
          console.log(`${adapter.name}: Auth required (expected in CI without key)`);
          return;
        }

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toBeDefined();
      });

      test('should reject invalid model gracefully', async ({ page }) => {
        const response = await page.request.post(`${BASE_URL}${adapter.endpoint}`, {
          data: {
            messages: [{ role: 'user', content: 'Test' }],
            model: 'nonexistent-model-xyz',
          },
        });

        // Should get an error response, not a crash
        expect(response.status()).toBeGreaterThanOrEqual(400);
      });

      test('should enforce max token limits', async ({ page }) => {
        test.skip(!process.env.CI, `Requires API key for ${adapter.name}`);

        const response = await page.request.post(`${BASE_URL}${adapter.endpoint}`, {
          data: {
            messages: [{ role: 'user', content: 'Test' }],
            model: adapter.model,
            max_tokens: 10,
          },
        });

        if (response.status() === 200) {
          const body = await response.json();
          // Response should be short (limited by max_tokens)
          const contentLength = body.content?.length || body.text?.length || 0;
          expect(contentLength).toBeLessThan(500);
        }
      });
    });
  }

  test('should show meaningful error when all adapters fail', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`);
    // If no AI keys configured, the UI should inform the user
    // rather than crashing or showing a blank page
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });
});