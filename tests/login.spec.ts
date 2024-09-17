import { test, expect } from './playwright-utils.js'

test('login', async ({ page, signUp }) => {
	const user = await signUp()

	await page.goto('/')

	// Should be redirected to login page
	await expect(
		page.getByRole('heading', { name: 'Login', level: 1 }),
	).toBeVisible()

	await page.getByRole('textbox', { name: 'Email' }).fill(user.email)
	await page.getByRole('textbox', { name: 'Password' }).fill(user.password)

	await page.getByRole('button', { name: 'Login' }).click()

	await expect(
		page.getByRole('heading', { name: 'Overview', level: 1 }),
	).toBeVisible()
	await expect(page.getByText(user.name)).toBeVisible()
})
