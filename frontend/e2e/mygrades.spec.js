import { test, expect } from '@playwright/test'

test.describe('My Grades page - student', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('student')
    await page.getByTestId('password').fill('student123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/my-grades')
  })

  test('shows own grades with course names', async ({ page }) => {
    await expect(page.getByTestId('mygrades-title')).toBeVisible()
    await expect(page.getByTestId('mygrades-table')).toBeVisible()
    const rows = page.locator('[data-testid="mygrades-table"] tbody tr')
    await expect(rows).toHaveCount(5)
    await expect(rows.nth(0)).toContainText('Mathematics')
    await expect(rows.nth(0)).toContainText('85')
    await expect(rows.nth(0)).toContainText('B')
  })

  test('shows average summary', async ({ page }) => {
    await expect(page.getByText(/5 courses/)).toBeVisible()
    await expect(page.getByText(/average/)).toBeVisible()
  })

  test('does not expose admin navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Students', exact: true })).toBeHidden()
    await expect(page.getByRole('link', { name: 'Courses', exact: true })).toBeHidden()
    await expect(page.getByRole('link', { name: 'Grades', exact: true })).toBeHidden()
  })

  test('is read-only: delete button never shown', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Delete' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Edit' })).toBeHidden()
  })
})