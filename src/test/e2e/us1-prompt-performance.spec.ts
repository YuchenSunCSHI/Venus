import { expect, test } from '@playwright/test';

const maxFeedbackMs = 1_000;

test.describe('US1 prompt interaction performance', () => {
  test('接受、稍后、跳过反馈在 1 秒内可感知', async ({ page }) => {
    await expectPromptActionWithinBudget(page, '开始休息', '全屏美感休息空间', 'region');
    await expectPromptActionWithinBudget(page, '稍后提醒', '已稍后提醒');
    await expectPromptActionWithinBudget(page, '跳过本次', '本轮已跳过');
  });
});

async function expectPromptActionWithinBudget(
  page: import('@playwright/test').Page,
  actionName: string,
  expectedName: string,
  role: 'heading' | 'region' = 'heading',
) {
  await page.goto('/?venusE2E=prompt');
  await expect(page.getByRole('heading', { name: '休息一下' })).toBeVisible();

  const startedAt = Date.now();
  await page.getByRole('button', { name: actionName }).click();
  await expect(page.getByRole(role, { name: expectedName })).toBeVisible({ timeout: maxFeedbackMs });

  expect(Date.now() - startedAt).toBeLessThanOrEqual(maxFeedbackMs);
}