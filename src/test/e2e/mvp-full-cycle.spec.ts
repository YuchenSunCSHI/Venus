import { expect, test } from '@playwright/test';

test.describe('MVP full cycle', () => {
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

  test('prompt 到美感空间、声音控制和返回工作完整闭环', async ({ page }) => {
    await page.goto('/?venusE2E=prompt&venusProvider=fallback');

    await expect(page.getByRole('heading', { name: '休息一下' })).toBeVisible();

    await page.getByRole('button', { name: '开始休息' }).click();
    await expect(page.getByRole('region', { name: '全屏美感休息空间' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '静静的草地' })).toBeVisible();
    await expect(page.getByText('已使用本地离线画面')).toBeVisible();

    await page.getByRole('button', { name: '开启声音' }).click();
    await expect(page.getByText('声音播放中')).toBeVisible();

    await page.getByRole('slider', { name: '音量' }).fill('35');
    await page.getByRole('button', { name: '静音' }).click();
    await expect(page.getByText('已静音')).toBeVisible();

    await page.getByRole('button', { name: '恢复声音' }).click();
    await expect(page.getByText('声音播放中')).toBeVisible();

    await page.keyboard.press('Space');
    await page.getByRole('region', { name: '全屏美感休息空间' }).hover();
    await page.getByRole('button', { name: '完成休息' }).click();

    await expect(page.getByRole('region', { name: '全屏美感休息空间' })).toBeHidden();
    await expect(page.getByRole('heading', { name: '休息完成' })).toBeVisible();
  });
});