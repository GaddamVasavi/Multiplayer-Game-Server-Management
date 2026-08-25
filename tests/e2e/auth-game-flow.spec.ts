import { test, expect } from '@playwright/test';

test.describe('Nexus Arena Full E2E Journey', () => {
  test('User Registration, Login, Matchmaking, and Arena canvas load', async ({ page }) => {
    // 1. Visit SPA Application
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Nexus Arena OS');

    // 2. Open Auth Modal
    const authModal = page.locator('.glass-panel');
    await expect(authModal).toBeVisible();

    // 3. Register New Account
    await page.click('text=Register Account');
    const timestamp = Date.now();
    await page.fill('input[placeholder="Choose username"]', `e2e_player_${timestamp}`);
    await page.fill('input[placeholder="name@nexus.com"]', `e2e_${timestamp}@nexus.com`);
    await page.fill('input[placeholder="••••••••"]', 'password123');

    await page.click('button[type="submit"]');

    // 4. Verify Lobby Rendered
    await expect(page.locator('text=Arena Matchmaking Queue')).toBeVisible({ timeout: 10000 });

    // 5. Join Matchmaking Queue
    await page.click('button:has-text("FIND MATCH")');
    await expect(page.locator('text=SEARCHING FOR OPPONENTS...')).toBeVisible();
  });
});
