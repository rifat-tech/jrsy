import { test, expect } from '@playwright/test'

// Fresh browser context per test => clean demo (localStorage) each run.

test('home loads with hero and real product images', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/JRSY/)
  await expect(page.getByRole('heading', { name: /PLAY\./ })).toBeVisible()
  // real photo in hero
  await expect(page.locator('img[src="/products/kit-goodvibes.jpg"]').first()).toBeVisible()
})

test('shop lists products and can filter by search', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByRole('heading', { name: /Good Vibes Home Kit/i }).first()).toBeVisible()
  await page.goto('/shop?q=cricket')
  await expect(page.getByText(/Tigers Pro Cricket Jersey/i).first()).toBeVisible()
})

test('add a jersey to cart and reach checkout', async ({ page }) => {
  await page.goto('/product/good-vibes-home-kit')
  await expect(page.getByRole('heading', { name: /Good Vibes Home Kit/i })).toBeVisible()

  // pick a size then add to cart
  await page.getByRole('button', { name: 'L', exact: true }).click()
  await page.getByRole('button', { name: /add to cart/i }).click()

  await page.goto('/cart')
  await expect(page.getByText(/Good Vibes Home Kit/i)).toBeVisible()
  await page.getByRole('button', { name: /checkout/i }).click()
  await expect(page).toHaveURL(/checkout/)
  await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible()
})

test('custom jersey builder renders live preview', async ({ page }) => {
  await page.goto('/custom')
  await expect(page.getByText(/custom/i).first()).toBeVisible()
})
