import type { Page } from '@playwright/test'
import { makeTransaction } from './factories/transaction'
import { test, expect } from './playwright-utils.js'
import { formatCurrency } from '~/utils/format'

test('Only recurring bills are shown', async ({
	page,
	signUp,
	login,
	seedDatabase,
}) => {
	const user = await signUp()
	const recurringBillOne = makeTransaction({
		date: new Date('2024-01-10'),
		isRecurring: true,
	})
	const recurringBillTwo = makeTransaction({
		date: new Date('2024-01-20'),
		isRecurring: true,
	})
	const nonRecurringTransaction = makeTransaction({
		date: new Date('2024-01-30'),
		isRecurring: false,
	})
	await seedDatabase({
		transactions: [recurringBillOne, recurringBillTwo, nonRecurringTransaction],
		user,
	})
	await login(user)

	const recurringBillsPage = new RecurringBillsPage(page)

	await recurringBillsPage.goto()

	const recurringBillOneUI = await recurringBillsPage.recurringBill({
		name: recurringBillOne.Counterparty.name,
		amount: recurringBillOne.amount,
	})
	const recurringBillTwoUI = await recurringBillsPage.recurringBill({
		name: recurringBillTwo.Counterparty.name,
		amount: recurringBillTwo.amount,
	})
	const nonRecurringTransactionUI = await recurringBillsPage.recurringBill({
		name: nonRecurringTransaction.Counterparty.name,
		amount: nonRecurringTransaction.amount,
	})

	await expect(recurringBillOneUI).toBeVisible()
	await expect(recurringBillTwoUI).toBeVisible()
	await expect(nonRecurringTransactionUI).toBeHidden()
})

class RecurringBillsPage {
	constructor(private page: Page) {}

	isSmallScreen() {
		const pageWidth = this.page.viewportSize()?.width
		if (!pageWidth) {
			throw new Error('Page width is not defined')
		}
		return pageWidth < 640
	}

	goto() {
		return this.page.goto('/recurring-bills')
	}

	recurringBill({ name, amount }: { name: string; amount: number }) {
		const formattedAmount = formatCurrency(Math.abs(amount))
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
