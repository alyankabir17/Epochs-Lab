import { test, expect } from '@playwright/test'

const setTheme = (theme) => (page) => page.addInitScript((value) => {
  window.localStorage.setItem('epochs_theme', value)
}, theme)

async function scrollToNormalSection(page) {
  await page.locator('#how').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await expect(page.locator('.landing-nav')).toHaveClass(/is-scrolled/)
}

test('captures light theme navbar over a normal section', async ({ page }) => {
  await setTheme('light')(page)
  await page.goto('/')
  await scrollToNormalSection(page)
  await page.screenshot({ path: 'artifacts/navbar/light-normal.png' })
})

test('captures dark theme navbar over a normal section', async ({ page }) => {
  await setTheme('dark')(page)
  await page.goto('/')
  await scrollToNormalSection(page)
  await page.screenshot({ path: 'artifacts/navbar/dark-normal.png' })
})

test('captures light theme navbar over the dark hero', async ({ page }) => {
  await setTheme('light')(page)
  await page.goto('/')
  await expect(page.locator('.landing-nav')).toHaveClass(/is-hero/)
  await page.screenshot({ path: 'artifacts/navbar/light-hero.png' })
})

test('captures dark theme navbar over the dark hero', async ({ page }) => {
  await setTheme('dark')(page)
  await page.goto('/')
  await expect(page.locator('.landing-nav')).toHaveClass(/is-hero/)
  await page.screenshot({ path: 'artifacts/navbar/dark-hero.png' })
})

test('captures the navbar without hover and with a hovered tab', async ({ page }) => {
  await setTheme('light')(page)
  await page.goto('/')
  await page.mouse.move(10, 200)
  const navBox = await page.locator('.landing-nav').boundingBox()
  expect(navBox.height).toBe(60)
  await page.screenshot({ path: 'artifacts/navbar/non-hover.png' })

  const pricing = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Pricing' })
  await pricing.hover()
  await page.waitForTimeout(400)
  const cursorBox = await page.locator('.slide-tabs-cursor').boundingBox()
  const pricingBox = await pricing.boundingBox()
  expect(cursorBox.x).toBeGreaterThanOrEqual(pricingBox.x - 2)
  expect(cursorBox.x + cursorBox.width).toBeLessThanOrEqual(pricingBox.x + pricingBox.width + 2)
  await page.screenshot({ path: 'artifacts/navbar/hover.png' })
})

test('captures the mobile hamburger menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page.screenshot({ path: 'artifacts/navbar/mobile-menu.png' })
})
