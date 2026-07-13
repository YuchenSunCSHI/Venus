import { expect, test } from '@playwright/test';

test.describe('US2 rest space', () => {
  test('在线 provider 可加载真实候选结构并按 Space 切换图片', async ({ page }) => {
    await page.route('https://commons.wikimedia.org/w/api.php**', async (route) => {
      expect(route.request().url()).toContain('generator=categorymembers');

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          query: {
            pages: {
              101: {
                pageid: 101,
                title: 'File:Quiet_lake.jpg',
                imageinfo: [
                  {
                    url: 'https://upload.wikimedia.org/venus/quiet-lake.jpg',
                    width: 2400,
                    height: 1600,
                    mime: 'image/jpeg',
                    extmetadata: {
                      LicenseShortName: { value: 'CC BY-SA 4.0' },
                      Artist: { value: 'Commons Photographer' },
                    },
                  },
                ],
              },
              102: {
                pageid: 102,
                title: 'File:Misty_forest.jpg',
                imageinfo: [
                  {
                    url: 'https://upload.wikimedia.org/venus/misty-forest.jpg',
                    width: 2600,
                    height: 1700,
                    mime: 'image/jpeg',
                    extmetadata: {
                      LicenseShortName: { value: 'CC BY-SA 4.0' },
                      Artist: { value: 'Commons Photographer' },
                    },
                  },
                ],
              },
            },
          },
        }),
      });
    });
    await page.route('https://upload.wikimedia.org/venus/**', async (route) => {
      await route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#789b7a"/></svg>',
      });
    });

    await page.goto('/?venusE2E=rest&venusProvider=online');

    const firstHeading = page.getByRole('heading', { name: /Quiet lake|Misty forest/ });
    await expect(firstHeading).toBeVisible();
    await expect(page.getByText('今日画面已准备好')).toBeVisible();
    const firstTitle = await firstHeading.textContent();

    await page.keyboard.press('Space');

    await expect(page.getByRole('heading', { name: firstTitle === 'Quiet lake' ? 'Misty forest' : 'Quiet lake' })).toBeVisible();
  });

  test('测试入口可以直接进入休息空间', async ({ page }) => {
    await page.goto('/?venusE2E=rest&venusProvider=fallback');

    await expect(page.getByRole('region', { name: '全屏美感休息空间' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '静静的草地' })).toBeVisible();
  });

  test('接受休息后进入 fallback 美感空间并返回工作', async ({ page }) => {
    await page.goto('/?venusE2E=prompt&venusProvider=fallback');

    await page.getByRole('button', { name: '开始休息' }).click();

    await expect(page.getByRole('region', { name: '全屏美感休息空间' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '静静的草地' })).toBeVisible();
    await expect(page.getByText('已使用本地离线画面')).toBeVisible();

    await page.getByRole('button', { name: '返回工作' }).click();
    await expect(page.getByRole('region', { name: '全屏美感休息空间' })).toBeHidden();
    await expect(page.getByRole('heading', { name: '已提前结束' })).toBeVisible();
  });

  test('控制项可通过鼠标 hover 浮现并完成休息', async ({ page }) => {
    await page.goto('/?venusE2E=prompt&venusProvider=fallback');

    await page.getByRole('button', { name: '开始休息' }).click();
    await expect(page.getByRole('heading', { name: '静静的草地' })).toBeVisible();
    await page.getByRole('region', { name: '全屏美感休息空间' }).hover();
    await page.getByRole('button', { name: '完成休息' }).click();

    await expect(page.getByRole('region', { name: '全屏美感休息空间' })).toBeHidden();
    await expect(page.getByRole('heading', { name: '休息完成' })).toBeVisible();
  });
});