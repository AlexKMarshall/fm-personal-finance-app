import setCookieParser from 'set-cookie-parser'
import { test as base, expect as baseExpect, type Page } from '@playwright/test'
import { makeUser } from './factories/user'
import { generateSalt, hashPassword, serializeAuthCookie } from '~/auth.server'
import { prisma } from '~/db/prisma.server'
import { makeTransaction } from './factories/transaction'
import { makeBudget } from './factories/budget'

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
		// Delete the dummy transactions that every new user gets, so we can test specific ones
		await prisma.transaction.deleteMany({
			where: {
				userId: savedUser.id,
			},
		})
		// Delete the dummy budgets that every new user gets, so we can test specific ones
		await prisma.budget.deleteMany({
			where: {
				userId: savedUser.id,
			},
		})
		onUserSaved?.(savedUser.id)

		return { ...savedUser, password }
	}
}
type SignupFixture = ReturnType<typeof makeSignupFixture>

function makeLoginFixture({ page }: { page: Page }) {
	return async function login(user: { name: string; id: string }) {
		const serializedAuthCookie = await serializeAuthCookie({
			userId: user.id,
			name: user.name,
		})
		const parsedAuthCookie = setCookieParser.parseString(serializedAuthCookie)

		await page.context().addCookies([
			{
				...(parsedAuthCookie as any),
				domain: 'localhost',
			},
		])
	}
}
type LoginFixture = ReturnType<typeof makeLoginFixture>

function makeSeedDatabaseFixture() {
	return async function seedDatabase({
		user,
		transactions = [],
		budgets = [],
	}: {
		user: { id: string }
		transactions?: Array<Parameters<typeof makeTransaction>[0]>
		budgets?: Array<Parameters<typeof makeBudget>[0]>
	}) {
		return Promise.all([
			...transactions
				.map((transaction) => makeTransaction(transaction))
				.map(({ Category, Counterparty, ...transaction }) =>
					prisma.transaction.create({
						data: {
							...transaction,
							User: {
								connect: {
									id: user.id,
								},
							},
							Counterparty: {
								connectOrCreate: {
									where: {
										name: Counterparty.name,
									},
									create: Counterparty,
								},
							},
							Category: {
								connectOrCreate: {
									where: {
										name: Category.name,
									},
									create: Category,
								},
							},
						},
					}),
				),
			...budgets
				.map((budget) => makeBudget(budget))
				.map(({ Category, Color, ...budget }) =>
					prisma.budget.create({
						data: {
							...budget,
							Category: {
								connectOrCreate: {
									where: {
										name: Category.name,
									},
									create: Category,
								},
							},
							Color: {
								connectOrCreate: {
									where: {
										name: Color.name,
									},
									create: Color,
								},
							},
							User: {
								connect: {
									id: user.id,
								},
							},
						},
					}),
				),
		])
	}
}
type SeedDatabaseFixture = ReturnType<typeof makeSeedDatabaseFixture>

export const test = base.extend<{
	signUp: SignupFixture
	login: LoginFixture
	seedDatabase: SeedDatabaseFixture
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwright uses this pattern to pass the fixtures.
	signUp: async ({}, use) => {
		let userId = ''
		await use(makeSignupFixture({ onUserSaved: (id) => (userId = id) }))
		await prisma.user.delete({
			where: { id: userId },
		})
	},
	login: async ({ page }, use) => {
		await use(makeLoginFixture({ page }))
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwright uses this pattern to pass the fixtures.
	seedDatabase: async ({}, use) => {
		await use(makeSeedDatabaseFixture())
	},
})

export const expect = baseExpect
