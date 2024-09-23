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

test('Only one instance of a recurring bill is shown', async ({
	page,
	signUp,
	login,
	seedDatabase,
}) => {
	const user = await signUp()
	const thisMonthBill = makeTransaction({
		date: new Date('2024-01-10'),
		isRecurring: true,
	})
	const lastMonthBill = makeTransaction({
		...thisMonthBill,
		date: new Date('2023-12-10'),
	})

	await seedDatabase({
		transactions: [thisMonthBill, lastMonthBill],
		user,
	})
	await login(user)

	const recurringBillsPage = new RecurringBillsPage(page)

	await recurringBillsPage.goto()

	await expect(recurringBillsPage.recurringBills()).toHaveCount(1)
})

test('calculated totals', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const billOne = makeTransaction({
		date: new Date('2024-01-10'),
		isRecurring: true,
		amount: 100 * 100,
	})
	const billTwo = makeTransaction({
		date: new Date('2024-01-20'),
		isRecurring: true,
		amount: 200 * 100,
	})
	await seedDatabase({
		transactions: [billOne, billTwo],
		user,
	})
	await login(user)

	const recurringBillsPage = new RecurringBillsPage(page)

	await recurringBillsPage.goto()

	await expect(recurringBillsPage.totalBillsSection()).toContainText('$300.00')
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

	recurringBills() {
		if (this.isSmallScreen()) {
			return this.page
				.getByTestId('recurring-bills-mobile')
				.getByRole('listitem')
		}
		return this.page
			.getByTestId('recurring-bills')
			.getByRole('row')
			.filter({ hasNotText: 'Bill Title' }) // Exclude the header row, for some reason filtering by hasNot role 'columnheader' isn't working
	}

	totalBillsSection() {
		return this.page
			.getByTestId('total-bills')
			.filter({ has: this.page.getByRole('heading', { name: /total bills/i }) })
	}
}
