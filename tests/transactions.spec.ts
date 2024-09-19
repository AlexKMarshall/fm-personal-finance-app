import type { Page } from '@playwright/test'
import { makeTransaction } from './factories/transaction'
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
}
