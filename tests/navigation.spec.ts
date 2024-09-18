import { test, expect } from './playwright-utils'

test('main navigation links', async ({ page, login }) => {
	await login()

	await page.goto('/')
	const mainNav = await page.getByRole('navigation')

	await mainNav.getByRole('link', { name: /transactions/i }).click()
	await expect(
		page.getByRole('heading', { name: /transactions/i }),
	).toBeVisible()

	await mainNav.getByRole('link', { name: /budgets/i }).click()
	await expect(page.getByRole('heading', { name: /budgets/i })).toBeVisible()

	await mainNav.getByRole('link', { name: /pots/i }).click()
	await expect(page.getByRole('heading', { name: /pots/i })).toBeVisible()

	await mainNav.getByRole('link', { name: /recurring bills/i }).click()
	await expect(
		page.getByRole('heading', { name: /recurring bills/i }),
	).toBeVisible()

	await mainNav.getByRole('link', { name: /overview/i }).click()
	await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
})
