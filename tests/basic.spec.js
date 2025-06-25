import { test, expect } from '@playwright/test';

const base = 'http://localhost:4173';

test('home page loads', async ({ page }) => {
  await page.goto(base + '/');
  await expect(page.locator('h1.leagueName')).toBeVisible();
});

test('managers page loads', async ({ page }) => {
  await page.goto(base + '/managers');
  await expect(page.locator('h2')).toContainText('Managers');
});
