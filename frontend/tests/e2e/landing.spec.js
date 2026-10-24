import { test, expect } from '@playwright/test'

let errors = []
test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/')
})
test.afterEach(() => expect(errors).toEqual([]))

test('hero uses the particle network and current workflow copy', async ({ page }) => {
  const hero = page.locator('#landing-hero')
  await expect(hero.getByRole('heading', { level: 1, name: 'From Dataset to Trained Model in Minutes' })).toBeVisible()
  await expect(hero.getByText('Describe your ML task, upload a dataset, and let specialist agents handle validation, preprocessing, model selection, training and evaluation, automatically.')).toBeVisible()
  await expect(hero.locator('canvas')).toHaveCount(1)
  await expect(hero.getByRole('button', { name: 'Start building' })).toBeVisible()
  await expect(hero.getByRole('button', { name: 'See how it works' })).toBeVisible()

  const navLinks = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link')
  await expect(navLinks).toHaveText(['How it works', 'Pricing', 'Features'])
  const navStyle = await page.locator('.landing-nav-inner').evaluate((element) => {
    const style = getComputedStyle(element)
    return { background: style.backgroundColor, border: style.borderTopColor, blur: style.backdropFilter }
  })
  expect(navStyle.background).toBe('rgba(15, 23, 42, 0.5)')
  expect(navStyle.border).toBe('rgba(255, 255, 255, 0.1)')
  expect(navStyle.blur).toBe('blur(12px)')
})

test('hero particle motion and nav magnetic motion honor reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page.locator('#landing-hero canvas')).toBeVisible()
  await page.getByRole('button', { name: 'See how it works' }).click()
  await expect(page.locator('#how')).toBeInViewport()
  const link = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'How it works' })
  await link.evaluate((element) => {
    element.style.setProperty('--magnetic-x', '0px')
    element.style.setProperty('--magnetic-y', '0px')
  })
  await link.hover()
  await expect(link).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
})

test('landing exposes the hero, pricing, agent pipeline and feature section', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /From Dataset to Trained Model/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Seven agents, one pipeline' })).toBeVisible()
  await expect(page.getByRole('list', { name: 'Seven-step agent pipeline' }).getByRole('listitem')).toHaveCount(7)
  await expect(page.getByRole('list', { name: 'Seven-step agent pipeline' }).getByRole('listitem').first()).toContainText('Orchestrator')
  await expect(page.getByRole('heading', { name: 'Pricing that follows your workflow' })).toBeVisible()
  await expect(page.getByText('Most chosen', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sandbox' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Builder' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'You stay in control' })).toBeVisible()
  await page.getByRole('button', { name: 'Monthly' }).click()
  await page.getByRole('button', { name: /Yearly/ }).click()
  await expect(page.getByRole('button', { name: /Yearly/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('$182', { exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: /Human-in-the-Loop/ })).toHaveAttribute('aria-selected', 'true')
})

test('feature tabs swap the mock notebook and support arrow-key navigation', async ({ page }) => {
  const tablist = page.getByRole('tablist', { name: 'Epochs Lab features' })
  const panel = page.getByRole('tabpanel')
  const approvalTab = tablist.getByRole('tab', { name: /Human-in-the-Loop/ })
  const repairTab = tablist.getByRole('tab', { name: /Self-Healing Execution/ })
  const stateTab = tablist.getByRole('tab', { name: /Resilient State/ })

  await expect(approvalTab).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('Awaiting Approval')
  await repairTab.focus()
  await page.keyboard.press('ArrowDown')
  await expect(stateTab).toBeFocused()
  await expect(stateTab).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('RandomForestClassifier')
  await repairTab.click()
  await expect(repairTab).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('[Agent] Error caught. Initiating auto-repair 1/3...')
})

test('CTA links to the app and FAQ accordion keeps only one answer open', async ({ page }) => {
  const cta = page.locator('.action-banner')
  await expect(cta.getByRole('heading', { name: 'Ready to automate your ML workflow? Start your first pipeline.' })).toBeVisible()
  await expect(cta.getByRole('link', { name: 'Start a Project' })).toHaveAttribute('href', '/app')

  const faq = page.locator('.landing-faq')
  await faq.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const firstQuestion = faq.getByRole('button', { name: 'What type of data does Epochs Lab support?' })
  const secondQuestion = faq.getByRole('button', { name: 'Can I step away while the agents are working?' })
  await firstQuestion.click()
  await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')
  await expect(faq.getByRole('region', { name: 'What type of data does Epochs Lab support?' })).toContainText('tabular CSV data')
  await secondQuestion.click()
  await expect(secondQuestion).toHaveAttribute('aria-expanded', 'true')
  await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
  await expect(faq.getByRole('button', { name: 'What happens if the generated code throws an error?' })).toHaveAttribute('aria-expanded', 'false')
})

test('agent pipeline alternates on wide screens and stacks behind a vertical rail on mobile', async ({ page }) => {
  const cards = page.locator('.agent-timeline-card')
  await page.setViewportSize({ width: 1440, height: 900 })
  const desktopCards = await cards.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect()
    return { left: rect.left, right: rect.right }
  }))
  const center = await page.evaluate(() => document.documentElement.clientWidth / 2)
  expect(desktopCards[0].right).toBeLessThan(center)
  expect(desktopCards[1].left).toBeGreaterThan(center)
  expect(desktopCards[2].right).toBeLessThan(center)

  await page.setViewportSize({ width: 390, height: 844 })
  const mobileCards = await cards.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect()
    return { left: rect.left, right: rect.right }
  }))
  expect(new Set(mobileCards.map(({ left }) => Math.round(left))).size).toBe(1)
  expect(mobileCards.every(({ right }) => right <= 390)).toBe(true)
  const marker = await page.locator('.agent-timeline-marker').first().boundingBox()
  expect(marker.x + marker.width).toBeLessThan(mobileCards[0].left)
})

test('pipeline cards and page sections reveal as they enter the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const cards = page.locator('.agent-timeline-card')
  await expect(cards.first()).not.toHaveAttribute('data-revealed', 'true')
  await expect(cards.last()).toHaveAttribute('data-revealed', 'false')
  await expect(cards.last()).toHaveCSS('opacity', '0')
  await expect(cards.last()).toHaveJSProperty('inert', true)
  await cards.first().evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(cards.first()).toHaveAttribute('data-revealed', 'true')
  await expect(cards.first()).toHaveJSProperty('inert', false)
  await expect(cards.first()).toHaveAttribute('data-reveal-from', 'left')
  await expect(cards.last()).not.toHaveAttribute('data-revealed', 'true')
  await cards.nth(1).evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(cards.nth(1)).toHaveAttribute('data-revealed', 'true')
  await expect(cards.nth(1)).toHaveAttribute('data-reveal-from', 'right')
  await cards.last().evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(cards.last()).toHaveAttribute('data-revealed', 'true')
  await expect(cards.last()).toHaveAttribute('data-reveal-from', 'left')
  await expect(cards.first()).toHaveAttribute('data-revealed', 'false')
  await expect(cards.first()).toHaveJSProperty('inert', true)
  await cards.first().evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(cards.first()).toHaveAttribute('data-revealed', 'true')
  await expect(cards.first()).toHaveJSProperty('inert', false)

  const pricingHeading = page.locator('#pricing [data-scroll-reveal]').first()
  await expect(pricingHeading).not.toHaveAttribute('data-revealed', 'true')
  await pricingHeading.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(pricingHeading).toHaveAttribute('data-revealed', 'true')
  await expect(pricingHeading).toHaveJSProperty('inert', false)
  await page.locator('#how').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await expect(pricingHeading).toHaveAttribute('data-revealed', 'false')
  await expect(pricingHeading).toHaveJSProperty('inert', true)
})

test('reduced motion keeps scroll content visible without reveal animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page.locator('html')).not.toHaveClass(/has-scroll-reveal/)
  await expect(page.locator('.agent-timeline-card').last()).toHaveCSS('opacity', '1')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`landing fits ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('heading', { name: /From Dataset to Trained Model/ })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
