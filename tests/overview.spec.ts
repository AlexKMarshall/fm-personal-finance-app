import type { Page } from '@playwright/test'
import { test, expect } from './playwright-utils.js'
import { formatCurrency } from '~/utils/format.js'
import { makeTransaction } from './factories/transaction.js'

test('shows latest 5 transactions', async ({
	page,
	signUp,
	seedDatabase,
	login,
}) => {
	const user = await signUp()
	const recentFiveTransactions = [
		makeTransaction({ date: new Date('2024-01-10') }),
		makeTransaction({ date: new Date('2024-01-09') }),
		makeTransaction({ date: new Date('2024-01-08') }),
		makeTransaction({ date: new Date('2024-01-07') }),
		makeTransaction({ date: new Date('2024-01-06') }),
	]
	const olderTransaction = makeTransaction({ date: new Date('2024-01-05') })
	await seedDatabase({
		transactions: [olderTransaction, ...recentFiveTransactions],
		user,
	})
	await login(user)

	const overviewPage = new OverviewPage(page)

	await overviewPage.goto()

	for (const transaction of recentFiveTransactions) {
		await expect(
			overviewPage.transaction({
				name: transaction.Counterparty.name,
				amount: transaction.amount,
			}),
		).toBeVisible()
	}

	await expect(
		overviewPage.transaction({
			name: olderTransaction.Counterparty.name,
			amount: olderTransaction.amount,
		}),
	).toBeHidden()
})

class OverviewPage {
	constructor(private page: Page) {}

	isSmallScreen() {
		const pageWidth = this.page.viewportSize()?.width
		if (!pageWidth) {
			throw new Error('Page width is not defined')
		}
		return pageWidth < 640
	}

	goto() {
		return this.page.goto('/overview')
	}

	transaction({ name, amount }: { name: string; amount: number }) {
		const formattedAmount = formatCurrency(amount)

		return this.page
			.getByRole('listitem')
			.filter({ hasText: name })
			.filter({ hasText: formattedAmount })
	}
}
