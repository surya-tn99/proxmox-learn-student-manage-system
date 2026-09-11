import { test, expect } from '@playwright/test'

const TEST_CODE = 'PWT101'

test.describe('Courses page - admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('admin')
    await page.getByTestId('password').fill('admin123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/')
    await page.goto('/courses')
    await expect(page.getByTestId('courses-title')).toBeVisible()
  })

  test('lists seeded courses', async ({ page }) => {
    await expect(page.getByTestId('courses-table')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'MATH101' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'CS101' })).toBeVisible()
  })

  test('add + edit + delete a course', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Course' }).click()
    await page.getByTestId('course-code').fill(TEST_CODE)
    await page.getByTestId('course-name').fill('Playwright Course')
    await page.getByTestId('course-desc').fill('Course created by automated test')
    await page.getByTestId('course-credits').fill('3')
    await page.getByTestId('modal').getByRole('button', { name: 'Add Course' }).click()

    await expect(page.getByTestId('modal')).toBeHidden()
    const row = page.locator('tr', { has: page.getByRole('cell', { name: TEST_CODE }) })
    await expect(row).toContainText('Playwright Course')

    await row.getByRole('button', { name: 'Edit' }).click()
    await page.getByTestId('course-name').fill('Playwright Course Edited')
    await page.getByTestId('modal').getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.locator('tr', { has: page.getByRole('cell', { name: TEST_CODE }) })).toContainText('Playwright Course Edited')

    page.on('dialog', (d) => d.accept())
    await page.locator('tr', { has: page.getByRole('cell', { name: TEST_CODE }) }).getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByRole('cell', { name: TEST_CODE })).toBeHidden()
  })

  test('duplicate course code is rejected', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Course' }).click()
    await page.getByTestId('course-code').fill('MATH101')
    await page.getByTestId('course-name').fill('Duplicate Course')
    await page.getByTestId('course-desc').fill('')
    await page.getByTestId('course-credits').fill('3')
    await page.getByTestId('modal').getByRole('button', { name: 'Add Course' }).click()
    await expect(page.getByRole('alert')).toContainText('Course code already exists')
  })
})