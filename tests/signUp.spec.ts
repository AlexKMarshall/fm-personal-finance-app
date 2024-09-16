import { faker } from '@faker-js/faker'
import { test, expect } from '@playwright/test'

test('sign up', async ({ page }) => {
	const user = makeUser()

	await page.goto('/sign-up')

	await expect(
		page.getByRole('heading', { name: 'Sign up', level: 1 }),
	).toBeVisible()

	await page.getByRole('textbox', { name: 'Name' }).fill(user.name)
	await page.getByRole('textbox', { name: 'Email' }).fill(user.email)
	await page.getByRole('textbox', { name: 'Password' }).fill(user.password)

	await page.getByRole('button', { name: 'Create account' }).click()

	await expect(
		page.getByRole('heading', { name: 'Overview', level: 1 }),
	).toBeVisible()
	await expect(page.getByText(user.name)).toBeVisible()
})

function makeUser(
	overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
	const name = overrides.name ?? faker.person.fullName()
	const email = overrides.email ?? faker.internet.email()
	const password = overrides.password ?? faker.internet.password()

	return {
		name,
		email,
		password,
	}
}
