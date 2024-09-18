import setCookieParser from 'set-cookie-parser'
import { test as base, expect as baseExpect, type Page } from '@playwright/test'
import { makeUser } from './factories/user'
import { generateSalt, hashPassword, serializeAuthCookie } from '~/auth.server'
import { prisma } from '~/db/prisma.server'

function makeSignupFixture({
	onUserSaved,
}: { onUserSaved?: (userId: string) => void } = {}) {
	return async function signUp({
		user: userOverrides,
	}: {
		user?: Parameters<typeof makeUser>[0]
	} = {}) {
		const { name, email, password } = makeUser(userOverrides)
		const salt = generateSalt()
		const hash = hashPassword({ password, salt })
		const savedUser = await prisma.user.create({
			data: {
				name,
				email,
				Password: {
					create: {
						hash,
						salt,
					},
				},
			},
		})
		onUserSaved?.(savedUser.id)

		return { ...savedUser, password }
	}
}
type SignupFixture = ReturnType<typeof makeSignupFixture>

function makeLoginFixture({
	signup,
	page,
}: {
	signup: SignupFixture
	page: Page
}) {
	return async function login({
		user: userOverrides,
	}: {
		user?: Parameters<typeof makeUser>[0]
	} = {}) {
		const { id, name } = await signup({ user: userOverrides })

		const serializedAuthCookie = await serializeAuthCookie({
			userId: id,
			name,
		})
		const parsedAuthCookie = setCookieParser.parseString(serializedAuthCookie)

		await page.context().addCookies([
			{
				...(parsedAuthCookie as any),
				domain: 'localhost',
			},
		])

		return { id, name }
	}
}
type LoginFixture = ReturnType<typeof makeLoginFixture>

export const test = base.extend<{
	signUp: SignupFixture
	login: LoginFixture
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwright uses this pattern to pass the fixtures.
	signUp: async ({}, use) => {
		let userId = ''
		await use(makeSignupFixture({ onUserSaved: (id) => (userId = id) }))
		await prisma.user.delete({
			where: { id: userId },
		})
	},
	login: async ({ signUp, page }, use) => {
		await use(makeLoginFixture({ signup: signUp, page }))
	},
})

export const expect = baseExpect
