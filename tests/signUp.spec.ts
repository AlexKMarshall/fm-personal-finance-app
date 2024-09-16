import { test, expect } from './playwright-utils'
import { makeUser } from './factories/user'

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

test('cannot sign up with an existing email', async ({ page, signUp }) => {
	const existingUser = await signUp()
	const conflictingUser = makeUser({ email: existingUser.email })

	await page.goto('/sign-up')

	await page.getByRole('textbox', { name: 'Name' }).fill(conflictingUser.name)
	await page.getByRole('textbox', { name: 'Email' }).fill(conflictingUser.email)
	await page
		.getByRole('textbox', { name: 'Password' })
		.fill(conflictingUser.password)

	await page.getByRole('button', { name: 'Create account' }).click()

	await expect(page.getByText('Email is already in use')).toBeVisible()
})
