import type { Page } from '@playwright/test'
import { makeTransaction } from './factories/transaction'
import { test, expect } from './playwright-utils.js'
import { formatCurrency } from '~/utils/format'
import { makeCategory } from './factories/category'

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

test('sort transactions', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const transactionOne = makeTransaction({
		amount: 10_000,
		date: new Date('2021-01-01'),
		Counterparty: { name: 'B company' },
	})
	const transactionTwo = makeTransaction({
		amount: 5_000,
		date: new Date('2021-01-02'),
		Counterparty: { name: 'A company' },
	})
	const transactionThree = makeTransaction({
		amount: -10_000,
		date: new Date('2021-01-03'),
		Counterparty: { name: 'C company' },
	})

	await seedDatabase({
		user,
		transactions: [transactionOne, transactionTwo, transactionThree],
	})
	await login(user)

	const transactionsPage = new TransactionsPage(page)

	await transactionsPage.goto()

	const transactionsUi = transactionsPage.transactions()

	// By default transactions are sorted with latest first
	await expect(transactionsUi).toContainText([
		transactionThree.Counterparty.name,
		transactionTwo.Counterparty.name,
		transactionOne.Counterparty.name,
	])

	await transactionsPage.sortBy('Oldest')
	await expect(transactionsUi).toContainText([
		transactionOne.Counterparty.name,
		transactionTwo.Counterparty.name,
		transactionThree.Counterparty.name,
	])

	await transactionsPage.sortBy('A to Z')
	await expect(transactionsUi).toContainText([
		transactionTwo.Counterparty.name,
		transactionOne.Counterparty.name,
		transactionThree.Counterparty.name,
	])

	await transactionsPage.sortBy('Z to A')
	await expect(transactionsUi).toContainText([
		transactionThree.Counterparty.name,
		transactionOne.Counterparty.name,
		transactionTwo.Counterparty.name,
	])

	await transactionsPage.sortBy('Lowest')
	await expect(transactionsUi).toContainText([
		transactionThree.Counterparty.name,
		transactionTwo.Counterparty.name,
		transactionOne.Counterparty.name,
	])

	await transactionsPage.sortBy('Highest')
	await expect(transactionsUi).toContainText([
		transactionOne.Counterparty.name,
		transactionTwo.Counterparty.name,
		transactionThree.Counterparty.name,
	])

	await transactionsPage.sortBy('Latest')
	await expect(transactionsUi).toContainText([
		transactionThree.Counterparty.name,
		transactionTwo.Counterparty.name,
		transactionOne.Counterparty.name,
	])
})

test('search transactions', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const transactionOne = makeTransaction({
		Counterparty: { name: 'Cat food company' },
	})
	const transactionTwo = makeTransaction({
		Counterparty: { name: 'Dog food company' },
	})
	const transactionThree = makeTransaction({
		Counterparty: { name: 'Cat grooming company' },
	})

	await seedDatabase({
		user,
		transactions: [transactionOne, transactionTwo, transactionThree],
	})
	await login(user)

	const transactionsPage = new TransactionsPage(page)

	await transactionsPage.goto()

	const transactionOneUi = transactionsPage.transaction({
		name: transactionOne.Counterparty.name,
		amount: transactionOne.amount,
	})
	const transactionTwoUi = transactionsPage.transaction({
		name: transactionTwo.Counterparty.name,
		amount: transactionTwo.amount,
	})
	const transactionThreeUi = transactionsPage.transaction({
		name: transactionThree.Counterparty.name,
		amount: transactionThree.amount,
	})

	await transactionsPage.search('cat')
	await expect(transactionOneUi).toBeVisible()
	await expect(transactionTwoUi).toBeHidden()
	await expect(transactionThreeUi).toBeVisible()

	await transactionsPage.search('food')
	await expect(transactionOneUi).toBeVisible()
	await expect(transactionTwoUi).toBeVisible()
	await expect(transactionThreeUi).toBeHidden()
})

test('filter,search, and sort combination', async ({
	signUp,
	login,
	seedDatabase,
	page,
}) => {
	// We want to make sure that changing one control doesn't remove any others
	const user = await signUp()
	const transactionOne = makeTransaction({
		amount: 100,
		date: new Date('2021-01-01'),
		Counterparty: { name: 'Cat food' },
		Category: { name: 'Category One' },
	})
	const transactionTwo = makeTransaction({
		amount: 200,
		date: new Date('2021-01-02'),
		Counterparty: { name: 'Dog food' },
		Category: { name: 'Category One' },
	})
	const transactionThree = makeTransaction({
		amount: 300,
		date: new Date('2021-01-02'),
		Counterparty: { name: 'Cat food' },
		Category: { name: 'Category Two' },
	})
	const transactionFour = makeTransaction({
		amount: 400,
		date: new Date('2021-01-02'),
		Counterparty: { name: 'Fishing supplies' },
		Category: { name: 'Category One' },
	})
	const transactionFive = makeTransaction({
		amount: 500,
		date: new Date('2021-01-03'),
		Counterparty: { name: 'Fishing supplies' },
		Category: { name: 'Category Two' },
	})

	await seedDatabase({
		user,
		transactions: [
			transactionOne,
			transactionTwo,
			transactionThree,
			transactionFour,
			transactionFive,
		],
	})
	await login(user)

	const transactionsPage = new TransactionsPage(page)

	await transactionsPage.goto()

	const transactionsUi = transactionsPage.transactions()

	await transactionsPage.filterByCategory('Category One')
	await transactionsPage.sortBy('Oldest')
	await transactionsPage.search('food')

	const visibleTransactions = [transactionOne, transactionTwo]
	const hiddenTransactions = [
		transactionThree,
		transactionFour,
		transactionFive,
	]

	// Visible transactions appear in order
	await expect(transactionsUi).toContainText(
		visibleTransactions.map((t) => t.Counterparty.name),
	)

	// The rest are hidden
	for (const transaction of hiddenTransactions) {
		await expect(
			transactionsPage.transaction({
				name: transaction.Counterparty.name,
				amount: transaction.amount,
			}),
		).toBeHidden()
	}
})
test('pagination', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	// 2 full pages and one partial page
	const transactions = Array.from({ length: 25 }, () => makeTransaction())
	await seedDatabase({ user, transactions })
	await login(user)

	const transactionsPage = new TransactionsPage(page)

	await transactionsPage.goto()

	const transactionsUi = transactionsPage.transactions()

	await expect(transactionsUi).toHaveCount(10)

	await transactionsPage.nextPage()
	await expect(transactionsUi).toHaveCount(10)

	await transactionsPage.nextPage()
	await expect(transactionsUi).toHaveCount(5)
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

	transactions() {
		if (this.isSmallScreen()) {
			return this.page.getByTestId('transactions-mobile').getByRole('listitem')
		}
		return this.page
			.getByTestId('transactions')
			.getByRole('row')
			.filter({ hasNotText: 'Recipient / Sender' }) // Exclude the header row, for some reason filtering by hasNot role 'columnheader' isn't working
	}

	async filterByCategory(category: string) {
		await this.page.getByRole('button', { name: /category/i }).click()
		return this.page
			.getByRole('listbox', { name: /category/i })
			.getByRole('option', { name: category })
			.click()
	}

	async sortBy(sort: string) {
		await this.page.getByRole('button', { name: /sort by/i }).click()
		return this.page
			.getByRole('listbox', { name: /sort by/i })
			.getByRole('option', { name: sort })
			.click()
	}

	search(search: string) {
		return this.page
			.getByRole('searchbox', { name: /search transaction/i })
			.fill(search)
	}

	nextPage() {
		return this.page.getByRole('link', { name: /next/i }).click()
	}

	previousPage() {
		return this.page.getByRole('link', { name: /prev/i }).click()
	}
}
