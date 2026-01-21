import { test, expect } from '@playwright/test';

test.describe('A2UI Playground', () => {
  test('home page loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('A2UI Playground');
  });

  test('header controls are visible', async ({ page }) => {
    await page.goto('/');

    // Mode toggle buttons
    await expect(page.getByRole('button', { name: /playground/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /game creator/i })).toBeVisible();

    // Action buttons
    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /components/i })).toBeVisible();
  });

  test('tab navigation works', async ({ page }) => {
    await page.goto('/');

    // Check tabs are visible
    await expect(page.getByRole('tab', { name: /chat/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /json/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tree/i })).toBeVisible();

    // Click JSON tab and verify it becomes active
    await page.getByRole('tab', { name: /json/i }).click();
    await expect(page.getByRole('tab', { name: /json/i })).toHaveAttribute('data-state', 'active');
  });

  test('view mode toggle works', async ({ page }) => {
    await page.goto('/');

    // Default should be split view
    // Click preview-only button (Eye icon)
    const previewButton = page.locator('button[title="Preview Only"]');
    await previewButton.click();

    // Click back to split view
    const splitButton = page.locator('button[title="Split View"]');
    await splitButton.click();
  });
});
