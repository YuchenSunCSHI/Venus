import { expect, test } from '@playwright/test';

test('US2 rest space fallback 2 秒内可见', async ({ page }) => {
  await page.goto('/?venusE2E=prompt&venusProvider=fallback');

  const startedAt = Date.now();
  await page.getByRole('button', { name: '开始休息' }).click();
  await expect(page.getByRole('heading', { name: '静静的草地' })).toBeVisible({ timeout: 2_000 });

  expect(Date.now() - startedAt).toBeLessThanOrEqual(2_000);
});