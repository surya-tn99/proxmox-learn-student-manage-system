import { test, expect } from '@playwright/test'

test.describe('Dashboard - admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('admin')
    await page.getByTestId('password').fill('admin123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/')
  })

  test('shows all stats cards', async ({ page }) => {
    await expect(page.getByTestId('dashboard-title')).toBeVisible()
    await expect(page.getByTestId('stat-total_students')).toBeVisible()
    await expect(page.getByTestId('stat-total_courses')).toBeVisible()
    await expect(page.getByTestId('stat-total_grades')).toBeVisible()
    await expect(page.getByTestId('stat-avg_marks')).toBeVisible()
  })

  test('students count matches seeded data', async ({ page }) => {
    await expect(page.getByTestId('stat-total_students')).toContainText('8')
    await expect(page.getByTestId('stat-total_courses')).toContainText('5')
    await expect(page.getByTestId('stat-total_grades')).toContainText('40')
  })

  test('navbar shows admin-only links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Students' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Courses' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Grades' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'My Grades' })).toBeHidden()
  })
})

test.describe('Dashboard - student', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('username').fill('student')
    await page.getByTestId('password').fill('student123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/my-grades')
  })

  test('student is redirected to my-grades on login', async ({ page }) => {
    await expect(page).toHaveURL('/my-grades')
  })

  test('student can visit dashboard and sees own stats', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('dashboard-title')).toBeVisible()
    await expect(page.getByTestId('stat-total_grades')).toContainText('5')
    await expect(page.getByTestId('stat-avg_marks')).toBeVisible()
  })

  test('student is blocked from admin-only pages', async ({ page }) => {
    await page.goto('/students')
    await expect(page).toHaveURL('/my-grades')
    await page.goto('/grades')
    await expect(page).toHaveURL('/my-grades')
  })
})