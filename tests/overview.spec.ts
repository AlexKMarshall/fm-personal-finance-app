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
test('shows total paid, upcoming, and due soon bills', async ({
	page,
	signUp,
	login,
	seedDatabase,
}) => {
	const user = await signUp()
	const paidBills = [
		makeTransaction({
			date: new Date('2024-01-10'),
			amount: -10 * 100,
			isRecurring: true,
		}),
		makeTransaction({
			date: new Date('2024-01-09'),
			amount: -20 * 100,
			isRecurring: true,
		}),
	]
	const soonBills = [
		makeTransaction({
			date: new Date('2023-12-11'),
			amount: -30 * 100,
			isRecurring: true,
		}),
		makeTransaction({
			date: new Date('2023-12-13'),
			amount: -40 * 100,
			isRecurring: true,
		}),
	]
	const upcomingBills = [
		makeTransaction({
			date: new Date('2023-12-21'),
			amount: -50 * 100,
			isRecurring: true,
		}),
		makeTransaction({
			date: new Date('2023-12-22'),
			amount: -60 * 100,
			isRecurring: true,
		}),
	]
	await seedDatabase({
		transactions: [...paidBills, ...soonBills, ...upcomingBills],
		user,
	})
	await login(user)

	const overviewPage = new OverviewPage(page)

	await overviewPage.goto()

	await expect(overviewPage.paidBills()).toContainText('$30.00')
	await expect(overviewPage.dueSoon()).toContainText('$70.00')
	await expect(overviewPage.totalUpcoming()).toContainText('$110.00')
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

	definition(term: string) {
		return this.page
			.getByTestId('definitionListItem')
			.filter({
				has: this.page.getByRole('term').getByText(term),
			})
			.getByRole('definition')
	}

	paidBills() {
		return this.definition('Paid Bills')
	}
	totalUpcoming() {
		return this.definition('Total Upcoming')
	}
	dueSoon() {
		return this.definition('Due Soon')
	}
}
