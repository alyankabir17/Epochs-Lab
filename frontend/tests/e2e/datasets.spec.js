import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Start a project', exact: true }).first().click()
  await page.getByRole('link', { name: 'Datasets', exact: true }).click()
})

test('dataset cards open the explorer while workspace links remain available', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'View dataset' })).toHaveCount(3)
  await expect(page.getByRole('link', { name: /Open workspace/ })).toHaveCount(3)
  await page.getByRole('link', { name: 'View dataset' }).first().click()
  await expect(page.getByRole('heading', { name: 'Customer churn' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Column profile' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data preview' })).toBeVisible()
  await page.getByRole('button', { name: 'Tail' }).click()
  await page.getByLabel('Show rows').selectOption('25')
  await page.getByLabel('Filter rows').fill('France')
  await expect(page.locator('.dataset-table-wrap')).toContainText('France')
})

test('uploading a CSV opens its explorer and profiles real rows', async ({ page }) => {
  await page.getByLabel('Upload CSV dataset').setInputFiles({
    name: 'sales.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Product,Amount,Region\nDesk,120,North\nChair,80,South\nLamp,45,North'),
  })
  await expect(page.getByRole('heading', { name: 'sales' })).toBeVisible()
  await expect(page.getByText('Uploaded', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Column profile' })).toBeVisible()
  await expect(page.locator('.dataset-table-wrap')).toContainText('Desk')
})
