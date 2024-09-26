import { makeBudget } from './factories/budget'
import { makeTransaction } from './factories/transaction'
import { test, expect } from './playwright-utils'
import type { Page } from '@playwright/test'

test('viewing budgets', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const budgetOne = makeBudget({ amount: 500 * 100 })
	// The most recent 3 transactions are displayed but all transactions count towards the total
	const budgetOneTransactionOne = makeTransaction({
		amount: 100 * 100,
		Category: budgetOne.Category,
		date: new Date('2024-01-10'),
	})
	const budgetOneTransactionTwo = makeTransaction({
		amount: 200 * 100,
		Category: budgetOne.Category,
		date: new Date('2024-01-09'),
	})
	const budgetOneTransactionThree = makeTransaction({
		amount: 300 * 100,
		Category: budgetOne.Category,
		date: new Date('2024-01-08'),
	})
	const budgetOneTransactionFour = makeTransaction({
		amount: 400 * 100,
		Category: budgetOne.Category,
		date: new Date('2024-01-07'),
	})

	const budgetTwo = makeBudget({ amount: 1000 * 100 })
	const budgetTwoTransactionOne = makeTransaction({
		amount: 500 * 100,
		Category: budgetTwo.Category,
		date: new Date('2024-01-10'),
	})
	const budgetTwoTransactionTwo = makeTransaction({
		amount: 500 * 100,
		Category: budgetTwo.Category,
		date: new Date('2024-01-09'),
	})
	const budgetTwoTransactionThree = makeTransaction({
		amount: 500 * 100,
		Category: budgetTwo.Category,
		date: new Date('2024-01-08'),
	})
	const budgetTwoTransactionFour = makeTransaction({
		amount: 500 * 100,
		Category: budgetTwo.Category,
		date: new Date('2024-01-07'),
	})

	await seedDatabase({
		budgets: [budgetOne, budgetTwo],
		transactions: [
			budgetOneTransactionOne,
			budgetOneTransactionTwo,
			budgetOneTransactionThree,
			budgetOneTransactionFour,
			budgetTwoTransactionOne,
			budgetTwoTransactionTwo,
			budgetTwoTransactionThree,
			budgetTwoTransactionFour,
		],
		user,
	})
	await login(user)

	const budgetsPage = new BudgetsPage(page)
	await budgetsPage.goto()

	const budgetOneUi = await budgetsPage.budget(budgetOne.Category.name)
	const budgetTwoUi = await budgetsPage.budget(budgetTwo.Category.name)

	await expect(
		budgetOneUi.getByRole('heading', { name: 'Maximum of $500.00' }),
	).toBeVisible()
	for (const transaction of [
		budgetOneTransactionOne,
		budgetOneTransactionTwo,
		budgetOneTransactionThree,
	]) {
		await expect(
			budgetsPage.transaction({
				category: budgetOne.Category.name,
				name: transaction.Counterparty.name,
			}),
		).toBeVisible()
	}
	await expect(
		budgetsPage.transaction({
			category: budgetOne.Category.name,
			name: budgetOneTransactionFour.Counterparty.name,
		}),
	).toBeHidden()

	await expect(
		budgetTwoUi.getByRole('heading', { name: 'Maximum of $1,000.00' }),
	).toBeVisible()

	for (const transaction of [
		budgetTwoTransactionOne,
		budgetTwoTransactionTwo,
		budgetTwoTransactionThree,
	]) {
		await expect(
			budgetsPage.transaction({
				category: budgetTwo.Category.name,
				name: transaction.Counterparty.name,
			}),
		).toBeVisible()
	}
	await expect(
		budgetsPage.transaction({
			category: budgetTwo.Category.name,
			name: budgetTwoTransactionFour.Counterparty.name,
		}),
	).toBeHidden()
})

class BudgetsPage {
	constructor(private page: Page) {}

	isSmallScreen() {
		const pageWidth = this.page.viewportSize()?.width
		if (!pageWidth) {
			throw new Error('Page width is not defined')
		}
		return pageWidth < 640
	}

	goto() {
		return this.page.goto('/budgets')
	}

	budget(category: string) {
		return this.page
			.getByTestId('budget')
			.filter({ has: this.page.getByRole('heading', { name: category }) })
	}

	transaction({ category, name }: { category: string; name: string }) {
		return this.budget(category).getByRole('listitem').filter({ hasText: name })
	}
}
