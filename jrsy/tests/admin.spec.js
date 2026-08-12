import { test, expect } from '@playwright/test'

// Logs in as the demo admin and automates the full product + banner lifecycle.

async function loginAsAdmin(page) {
  await page.goto('/login')
  await page.getByPlaceholder('you@email.com').fill('admin@jrsy.com')
  await page.getByPlaceholder('••••••••').fill('demo1234')
  await page.getByRole('button', { name: /^log in$/i }).click()
  await expect(page).toHaveURL(/account|admin|\/$/)
}

test('admin dashboard loads with stats', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  await expect(page.getByText(/total sales/i)).toBeVisible()
})

test('add → edit → delete a product', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/admin/products')

  const name = `Test Kit ${Date.now().toString().slice(-5)}`

  // ADD
  await page.getByRole('button', { name: /add product/i }).click()
  await page.getByPlaceholder('e.g. Home Jersey 2025/26').fill(name)
  await page.getByLabel('Category *').selectOption({ label: 'Club Jerseys' }).catch(async () => {
    // fallback if label association differs
    await page.locator('select').first().selectOption({ index: 1 })
  })
  // price is the first number input in the form
  await page.locator('input[type="number"]').first().fill('1500')
  await page.getByRole('button', { name: /add product/i }).last().click()
  await expect(page.getByText(name)).toBeVisible()

  // EDIT — open the row's edit (pencil) button
  const row = page.getByRole('row', { name: new RegExp(name) })
  await row.getByRole('button').first().click()
  await page.locator('input[type="number"]').first().fill('1800')
  await page.getByRole('button', { name: /save changes/i }).click()
  await expect(page.getByText(name)).toBeVisible()

  // DELETE — trash button then confirm
  const row2 = page.getByRole('row', { name: new RegExp(name) })
  await row2.getByRole('button').last().click()
  await page.getByRole('button', { name: /^delete$/i }).click()
  await expect(page.getByText(name)).toHaveCount(0)
})

test('change a homepage banner title', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/admin/banners')

  const newTitle = `PROMO ${Date.now().toString().slice(-4)}`
  // edit first banner (pencil)
  await page.getByRole('button').filter({ has: page.locator('svg') }).nth(0)
  await page.locator('.card').first().getByRole('button').nth(1).click() // edit
  await page.getByPlaceholder('NEW SEASON').fill(newTitle)
  await page.getByRole('button', { name: /^save$/i }).click()
  await expect(page.getByText(newTitle)).toBeVisible()
})

test('update an order status', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/admin/orders')
  // open the first order's detail (eye)
  await page.locator('table tbody tr').first().getByRole('button').click()
  await page.getByRole('button', { name: /^shipped$/i }).click()
  await expect(page.getByText(/order updated/i)).toBeVisible()
})
