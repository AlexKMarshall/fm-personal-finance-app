import { test as base, expect as baseExpect } from '@playwright/test'
import { makeUser } from './factories/user'
import { generateSalt, hashPassword } from '~/auth.server'
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

export const test = base.extend<{
	signUp: ReturnType<typeof makeSignupFixture>
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwright uses this pattern to pass the fixtures.
	signUp: async ({}, use) => {
		let userId = ''
		await use(makeSignupFixture({ onUserSaved: (id) => (userId = id) }))
		await prisma.user.delete({
			where: { id: userId },
		})
	},
})

export const expect = baseExpect
