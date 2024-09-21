import type { Page } from '@playwright/test'
import { makeCategory, makeTransaction } from './factories/transaction'
import { test, expect } from './playwright-utils.js'
import { formatCurrency } from '~/utils/format'

test('shows a list of transactions', async ({
	page,
	signUp,
	login,
	seedDatabase,
}) => {
	const user = await signUp()
	const transactions = [makeTransaction(), makeTransaction(), makeTransaction()]
	await seedDatabase({ user, transactions })
	await login(user)

	const transactionsPage = new TransactionsPage(page)

	await transactionsPage.goto()

	for (const transaction of transactions) {
		await expect(
			transactionsPage.transaction({
				name: transaction.Counterparty.name,
				amount: transaction.amount,
			}),
		).toBeVisible()
	}
})

test('filter by category', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const categoryOne = makeCategory()
	const categoryTwo = makeCategory()
	const categoryThree = makeCategory()
	const transactionOne = makeTransaction({ Category: categoryOne })
	const transactionTwo = makeTransaction({ Category: categoryTwo })
	const transactionThree = makeTransaction({ Category: categoryThree })
	await seedDatabase({
		user,
		transactions: [transactionOne, transactionTwo, transactionThree],
	})
	await login(user)
	const transactionsPage = new TransactionsPage(page)

	await transactionsPage.goto()

	// By default nothing is filtered
	for (const transaction of [
		transactionOne,
		transactionTwo,
		transactionThree,
	]) {
		await expect(
			transactionsPage.transaction({
				name: transaction.Counterparty.name,
				amount: transaction.amount,
			}),
		).toBeVisible()
	}

	// Filter by category one
	await transactionsPage.filterByCategory(categoryOne.name)
	// Only transaction one should be visible
	await expect(
		transactionsPage.transaction({
			name: transactionOne.Counterparty.name,
			amount: transactionOne.amount,
		}),
	).toBeVisible()
	for (const transaction of [transactionTwo, transactionThree]) {
		await expect(
			transactionsPage.transaction({
				name: transaction.Counterparty.name,
				amount: transaction.amount,
			}),
		).not.toBeVisible()
	}

	// Filter by category two
	await transactionsPage.filterByCategory(categoryTwo.name)
	// Only transaction two should be visible
	await expect(
		transactionsPage.transaction({
			name: transactionTwo.Counterparty.name,
			amount: transactionTwo.amount,
		}),
	).toBeVisible()
	for (const transaction of [transactionOne, transactionThree]) {
		await expect(
			transactionsPage.transaction({
				name: transaction.Counterparty.name,
				amount: transaction.amount,
			}),
		).not.toBeVisible()
	}

	// Select all transactions
	await transactionsPage.filterByCategory('All Transactions')
	for (const transaction of [
		transactionOne,
		transactionTwo,
		transactionThree,
	]) {
		await expect(
			transactionsPage.transaction({
				name: transaction.Counterparty.name,
				amount: transaction.amount,
			}),
		).toBeVisible()
	}
})

class TransactionsPage {
	constructor(private page: Page) {}

	isSmallScreen() {
		const pageWidth = this.page.viewportSize()?.width
		if (!pageWidth) {
			throw new Error('Page width is not defined')
		}
		return pageWidth < 640
	}

	goto() {
		return this.page.goto('/transactions')
	}

	transaction({ name, amount }: { name: string; amount: number }) {
		const formattedAmount = formatCurrency(amount)
		if (this.isSmallScreen()) {
			return this.page
				.getByRole('listitem')
				.filter({ hasText: name })
				.filter({ hasText: formattedAmount })
		}

		return this.page
			.getByRole('row')
			.filter({ hasText: name })
			.filter({ hasText: formattedAmount })
	}

	async filterByCategory(category: string) {
		await this.page.getByLabel(/category/i).click()
		return this.page
			.getByRole('listbox', { name: /category/i })
			.getByRole('option', { name: category })
			.click()
	}
}
