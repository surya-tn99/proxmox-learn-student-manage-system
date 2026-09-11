import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'playwright.test@example.com'

test.describe('Students page - admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('admin')
    await page.getByTestId('password').fill('admin123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/')
    await page.goto('/students')
    await expect(page.getByTestId('students-title')).toBeVisible()
  })

  test('lists seeded students', async ({ page }) => {
    await expect(page.getByTestId('students-table')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Aarav Sharma' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Divya Nair' })).toBeVisible()
  })

  test('search filters the list', async ({ page }) => {
    await page.getByTestId('student-search').fill('Priya')
    await expect(page.getByRole('cell', { name: 'Priya Patel' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Aarav Sharma' })).toBeHidden()
  })

  test('add + edit + delete a student', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Student' }).click()
    await page.getByTestId('student-name').fill('Playwright Test')
    await page.getByTestId('student-email').fill(TEST_EMAIL)
    await page.getByTestId('student-phone').fill('+91 99999 00000')
    await page.getByTestId('student-enrollment').fill('2026-01-15')
    await page.getByTestId('modal').getByRole('button', { name: 'Add Student' }).click()

    await expect(page.getByTestId('modal')).toBeHidden()
    await expect(page.getByRole('cell', { name: TEST_EMAIL })).toBeVisible()

    const row = page.locator('tr', { has: page.getByRole('cell', { name: 'Playwright Test' }) })
    await row.getByRole('button', { name: 'Edit' }).click()
    await page.getByTestId('student-name').fill('Playwright Edited')
    await page.getByTestId('student-email').fill(TEST_EMAIL)
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('cell', { name: 'Playwright Edited' })).toBeVisible()

    const editedRow = page.locator('tr', { has: page.getByRole('cell', { name: 'Playwright Edited' }) })
    page.on('dialog', (d) => d.accept())
    await editedRow.getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByRole('cell', { name: TEST_EMAIL })).toBeHidden()
  })

  test('duplicate email is rejected', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Student' }).click()
    await page.getByTestId('student-name').fill('Duplicate Email')
    await page.getByTestId('student-email').fill('aarav@example.com')
    await page.getByTestId('student-phone').fill('')
    await page.getByTestId('student-enrollment').fill('')
    await page.getByTestId('modal').getByRole('button', { name: 'Add Student' }).click()
    await expect(page.getByRole('alert')).toContainText('Email already exists')
    await expect(page.getByTestId('modal')).toBeVisible()
    await page.getByTestId('modal').getByRole('button', { name: 'Cancel' }).click()
  })
})