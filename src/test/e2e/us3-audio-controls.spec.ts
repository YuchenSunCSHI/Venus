import { expect, test } from '@playwright/test';

test.describe('US3 audio controls', () => {
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

  test('开启、调节、静音并结束休息后声音控件消失', async ({ page }) => {
    await page.goto('/?venusE2E=rest&venusProvider=fallback');

    await page.getByRole('button', { name: '开启声音' }).click();
    await expect(page.getByText('声音播放中')).toBeVisible();

    await page.getByRole('slider', { name: '音量' }).fill('30');
    await page.getByRole('button', { name: '静音' }).click();
    await expect(page.getByText('已静音')).toBeVisible();

    await page.getByRole('button', { name: '完成休息' }).click();

    await expect(page.getByRole('region', { name: '全屏美感休息空间' })).toBeHidden();
    await expect(page.getByText('已静音')).toBeHidden();
  });
});