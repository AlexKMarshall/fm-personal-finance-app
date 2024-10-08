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
})

test('cannot login with invalid email', async ({ page, signUp }) => {
	const user = await signUp()

	await page.goto('/')

	await page
		.getByRole('textbox', { name: 'Email' })
		.fill('invalid-email@example.com')
	await page.getByRole('textbox', { name: 'Password' }).fill(user.password)

	await page.getByRole('button', { name: 'Login' }).click()

	await expect(page.getByText('Invalid email or password')).toBeVisible()
})

test('cannot login with invalid password', async ({ page, signUp }) => {
	const user = await signUp()

	await page.goto('/')

	await page.getByRole('textbox', { name: 'Email' }).fill(user.email)
	await page.getByRole('textbox', { name: 'Password' }).fill('invalid-password')

	await page.getByRole('button', { name: 'Login' }).click()

	await expect(page.getByText('Invalid email or password')).toBeVisible()
})

test('auth pages redirect to home if already authenticated', async ({
	page,
	signUp,
	login,
}) => {
	const user = await signUp()
	await login(user)

	await page.goto('/sign-up')
	await expect(
		page.getByRole('heading', { name: 'Overview', level: 1 }),
	).toBeVisible()

	await page.goto('/login')
	await expect(
		page.getByRole('heading', { name: 'Overview', level: 1 }),
	).toBeVisible()
})
