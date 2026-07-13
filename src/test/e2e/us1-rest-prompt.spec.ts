import { expect, test } from '@playwright/test';

test.describe('US1 rest prompt journey', () => {
  test('初次进入显示工作状态', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: '工作间隔进行中' })).toBeVisible();
    await expect(page.getByText(/下一次提醒约在/)).toBeVisible();
  });

  test('prompt pending 后可以接受休息', async ({ page }) => {
    await page.goto('/?venusE2E=prompt');

    await expect(page.getByRole('heading', { name: '休息一下' })).toBeVisible();
    await page.getByRole('button', { name: '开始休息' }).click();

    await expect(page.getByRole('heading', { name: '正在进入休息' })).toBeVisible();
  });

  test('prompt pending 后可以稍后提醒', async ({ page }) => {
    await page.goto('/?venusE2E=prompt');

    await page.getByRole('button', { name: '稍后提醒' }).click();

    await expect(page.getByRole('heading', { name: '已稍后提醒' })).toBeVisible();
  });

  test('prompt pending 后可以跳过本次', async ({ page }) => {
    await page.goto('/?venusE2E=prompt');

    await page.getByRole('button', { name: '跳过本次' }).click();

    await expect(page.getByRole('heading', { name: '本轮已跳过' })).toBeVisible();
  });
});