import { test, expect } from '@playwright/test'

test('login page renders its themed form and password toggle', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Sign in', exact: true }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  const password = page.locator('#login-password')
  await expect(password).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(password).toHaveAttribute('type', 'text')
  await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()

  await page.getByLabel('Email').fill('demo@example.com')
  await password.fill('anything')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /workspace/i })).toBeVisible()
})

test('signup page renders its form and links back to login', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Sign in', exact: true }).click()
  await page.getByRole('link', { name: 'Sign up', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  await expect(page.getByLabel('Full name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.locator('#signup-password')).toHaveAttribute('minlength', '8')
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  await page.getByRole('link', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})
