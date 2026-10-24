import { test, expect } from '@playwright/test'

let errors = []

test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/')
  await page.getByRole('link', { name: 'Start a project', exact: true }).first().click()
  await page.locator('article.project-card').filter({ hasText: 'Customer churn' }).getByRole('button', { name: /Review Gate/ }).click()
  await expect(page.getByRole('heading', { name: 'Customer churn' })).toBeVisible()
})

test.afterEach(() => expect(errors).toEqual([]))

test('renders the seven-stage rail and one notebook thread', async ({ page }) => {
  const rail = page.getByRole('list', { name: 'Pipeline stages' })
  await expect(rail.locator('.pipeline-rail-stage')).toHaveCount(7)
  await expect(rail).toContainText('Prompt Analysis')
  await expect(rail).toContainText('Dataset Search')
  await expect(rail).toContainText('Data Profiling')
  await expect(rail).toContainText('Preprocessing')
  await expect(rail).toContainText('Model Training')
  await expect(rail).toContainText('Evaluation')
  await expect(rail).toContainText('Report')
  await expect(page.getByText('Gate A', { exact: true })).toBeVisible()
  await expect(page.getByText('Gate B', { exact: true })).toBeVisible()
  await expect(page.locator('.pipeline-radial')).toHaveCount(0)
  await expect(page.locator('.pipeline-live-context')).toHaveCount(0)
  await expect(page.locator('.pipeline-terminal')).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'Ask the Notebook Copilot' })).toHaveCount(0)
  await expect(page.locator('.pipeline-approval-card').getByText('Approve the preprocessing plan', { exact: true })).toBeVisible()
})

test('keeps approval feedback compact until the user requests changes', async ({ page }) => {
  await expect(page.getByLabel('Comment for the agent')).toHaveCount(0)
  await page.getByRole('button', { name: 'Request changes', exact: true }).click()
  await expect(page.getByLabel('Comment for the agent')).toBeVisible()
  await page.getByLabel('Comment for the agent').fill('Keep the median imputation and explain the split.')
  await page.getByRole('button', { name: 'Send back', exact: true }).click()
  await expect(page.getByText('Feedback sent to the agent', { exact: true })).toBeVisible()
})

test('fresh runs pause only at Dataset Search and Preprocessing gates', async ({ page }) => {
  await page.getByRole('link', { name: 'All projects' }).click()
  await page.locator('article.project-card').filter({ hasText: 'House prices' }).getByRole('button', { name: /Live Kernel/ }).click()
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page.getByRole('button', { name: 'Restart project', exact: true }).click()
  await page.getByRole('button', { name: 'Start run', exact: true }).click()
  await expect(page.locator('.pipeline-approval-card').getByText('Choose a dataset', { exact: true })).toBeVisible({ timeout: 9000 })
  await expect(page.getByRole('radio', { name: /Bank Customer Churn/ })).toBeVisible()
  await page.getByRole('radio', { name: /Bank Customer Churn/ }).click()
  await page.getByRole('button', { name: 'Use this dataset', exact: true }).click()
  await expect(page.locator('.pipeline-approval-card').getByText('Approve the preprocessing plan', { exact: true })).toBeVisible({ timeout: 9000 })
  await expect(page.getByRole('button', { name: 'Approve preprocessing', exact: true })).toBeVisible()
  await expect(page.getByText('Pick a model', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Confirm training settings', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Approve the results', { exact: true })).toHaveCount(0)
})

test('restart is secondary, confirmed, and resets the run', async ({ page }) => {
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Restart this project?' })).toBeVisible()
  await page.getByRole('button', { name: 'Keep run', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Restart this project?' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page.getByRole('button', { name: 'Restart project', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start run', exact: true })).toBeVisible()
  await expect(page.getByText('Pending', { exact: true }).first()).toBeVisible()
})

for (const width of [390, 768, 1440]) {
  test(`pipeline remains readable without page overflow at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.screenshot({ path: info.outputPath('pipeline.png'), fullPage: true })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.getByRole('list', { name: 'Pipeline stages' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Everything the pipeline did, in context' })).toBeVisible()
  })
}
