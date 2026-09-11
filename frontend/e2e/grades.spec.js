import { test, expect } from '@playwright/test'

const TEST_STUDENT = {
  name: 'Playwright Grade Student',
  email: 'playwright.grades@example.com',
  phone: '+91 90000 12345',
  enrollment_date: '2026-02-01',
}

async function loginAdmin(page) {
  await page.goto('/login')
  await page.getByTestId('username').fill('admin')
  await page.getByTestId('password').fill('admin123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
}

async function getToken(request) {
  const res = await request.post('http://127.0.0.1:8000/api/auth/login', {
    data: { username: 'admin', password: 'admin123' },
  })
  return (await res.json()).token
}

test.describe('Grades page - admin', () => {
  test('shows seeded grades with student and course names', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/grades')
    await expect(page.getByTestId('grades-title')).toBeVisible()
    await expect(page.getByTestId('grades-table')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Aarav Sharma' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Mathematics' }).first()).toBeVisible()
  })

  test('filter by student narrows the list', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/grades')
    await page.getByTestId('filter-student').selectOption({ label: 'Aarav Sharma' })
    await expect(page.getByTestId('grades-table')).toBeVisible()
    const rows = page.locator('[data-testid^="grade-row-"]')
    await expect(rows).toHaveCount(5)
    await expect(rows.nth(0)).toContainText('Aarav Sharma')
  })

  test('assign, edit and delete a grade via a temp student', async ({ page, request }) => {
    const token = await getToken(request)
    const created = await request.post('http://127.0.0.1:8000/api/students', {
      headers: { Authorization: `Bearer ${token}` },
      data: TEST_STUDENT,
    })
    const student = await created.json()
    expect(created.ok()).toBeTruthy()

    try {
      await loginAdmin(page)
      await page.goto('/grades')

      await page.getByRole('button', { name: '+ Assign Grade' }).click()
      await page.getByTestId('grade-student').selectOption({ label: TEST_STUDENT.name })
      await page.getByTestId('grade-course').selectOption({ label: 'Mathematics' })
      await page.getByTestId('grade-marks').fill('95')
      await page.getByTestId('modal').getByRole('button', { name: 'Assign Grade' }).click()

      await expect(page.getByTestId('modal')).toBeHidden()
      const row = page.locator('tr', { has: page.getByRole('cell', { name: TEST_STUDENT.name }) })
      await expect(row).toContainText('95')
      await expect(row).toContainText('A')

      await row.getByRole('button', { name: 'Edit' }).click()
      await page.getByTestId('grade-marks').fill('55')
      await page.getByTestId('modal').getByRole('button', { name: 'Save Changes' }).click()
      await expect(page.locator('tr', { has: page.getByRole('cell', { name: TEST_STUDENT.name }) })).toContainText('55')
      await expect(page.locator('tr', { has: page.getByRole('cell', { name: TEST_STUDENT.name }) })).toContainText('F')

      page.on('dialog', (d) => d.accept())
      await page.locator('tr', { has: page.getByRole('cell', { name: TEST_STUDENT.name }) }).getByRole('button', { name: 'Delete' }).click()
      await expect(page.getByRole('cell', { name: TEST_STUDENT.name })).toBeHidden()
    } finally {
      await request.delete(`http://127.0.0.1:8000/api/students/${student.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    }
  })
})