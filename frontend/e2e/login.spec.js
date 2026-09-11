import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Student Manager' })).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('rejects wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('admin')
    await page.getByTestId('password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText('Invalid username or password')
  })

  test('admin login redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('admin')
    await page.getByTestId('password').fill('admin123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Student Manager')).toBeVisible()
  })

  test('student login redirects to my grades', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('student')
    await page.getByTestId('password').fill('student123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/my-grades')
  })

  test('already logged in redirects away from /login', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('admin')
    await page.getByTestId('password').fill('admin123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/')
    await page.goto('/login')
    await expect(page).toHaveURL('/')
  })
})