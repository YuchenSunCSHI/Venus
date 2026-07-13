import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: () => Promise.resolve(),
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: () => undefined,
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
      configurable: true,
      value: () => undefined,
    });
  });
});

test('US3 audio start, mute and stop feedback are visible within 1 second', async ({ page }) => {
  await page.goto('/?venusE2E=rest&venusProvider=fallback');

  await page.getByRole('button', { name: '开启声音' }).click();
  await expect(page.getByText('声音播放中')).toBeVisible({ timeout: 1_000 });

  await page.getByRole('button', { name: '静音' }).click();
  await expect(page.getByText('已静音')).toBeVisible({ timeout: 1_000 });

  await page.getByRole('button', { name: '完成休息' }).click();
  await expect(page.getByRole('heading', { name: '休息完成' })).toBeVisible({ timeout: 1_000 });
});