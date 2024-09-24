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

test('calculated totals and summary', async ({
	page,
	signUp,
	login,
	seedDatabase,
}) => {
	const user = await signUp()
	const billPaid = makeTransaction({
		date: new Date('2024-01-10'),
		isRecurring: true,
		amount: 100 * 100,
	})
	const billSoon = makeTransaction({
		date: new Date('2023-12-12'),
		isRecurring: true,
		amount: 200 * 100,
	})
	const billUpcoming = makeTransaction({
		date: new Date('2023-12-20'),
		isRecurring: true,
		amount: 300 * 100,
	})
	await seedDatabase({
		transactions: [billPaid, billSoon, billUpcoming],
		user,
	})
	await login(user)

	const recurringBillsPage = new RecurringBillsPage(page)

	await recurringBillsPage.goto()

	await expect(recurringBillsPage.totalBillsSection()).toContainText('$600.00')

	await expect(recurringBillsPage.totalPaid()).toContainText('$100.00')
	await expect(recurringBillsPage.totalUpcoming()).toContainText('$300.00')
	await expect(recurringBillsPage.dueSoon()).toContainText('$200.00')
})
test('sort bills', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const paidBill = makeTransaction({
		date: new Date('2024-01-10'),
		isRecurring: true,
		amount: -100 * 100,
		Counterparty: { name: 'C company' },
	})
	const soonBill = makeTransaction({
		date: new Date('2023-12-12'),
		isRecurring: true,
		amount: -200 * 100,
		Counterparty: { name: 'B company' },
	})
	const upcomingBill = makeTransaction({
		date: new Date('2023-12-20'),
		isRecurring: true,
		amount: -300 * 100,
		Counterparty: { name: 'A company' },
	})

	await seedDatabase({
		transactions: [paidBill, soonBill, upcomingBill],
		user,
	})
	await login(user)

	const recurringBillsPage = new RecurringBillsPage(page)

	await recurringBillsPage.goto()

	// Default sort is latest first
	await expect(recurringBillsPage.recurringBills()).toContainText([
		upcomingBill.Counterparty.name,
		soonBill.Counterparty.name,
		paidBill.Counterparty.name,
	])

	await recurringBillsPage.sortBy('Oldest')
	await expect(recurringBillsPage.recurringBills()).toContainText([
		paidBill.Counterparty.name,
		soonBill.Counterparty.name,
		upcomingBill.Counterparty.name,
	])

	await recurringBillsPage.sortBy('A to Z')
	await expect(recurringBillsPage.recurringBills()).toContainText([
		upcomingBill.Counterparty.name,
		soonBill.Counterparty.name,
		paidBill.Counterparty.name,
	])

	await recurringBillsPage.sortBy('Z to A')
	await expect(recurringBillsPage.recurringBills()).toContainText([
		paidBill.Counterparty.name,
		soonBill.Counterparty.name,
		upcomingBill.Counterparty.name,
	])

	await recurringBillsPage.sortBy('Highest')
	await expect(recurringBillsPage.recurringBills()).toContainText([
		upcomingBill.Counterparty.name,
		soonBill.Counterparty.name,
		paidBill.Counterparty.name,
	])

	await recurringBillsPage.sortBy('Lowest')
	await expect(recurringBillsPage.recurringBills()).toContainText([
		paidBill.Counterparty.name,
		soonBill.Counterparty.name,
		upcomingBill.Counterparty.name,
	])

	await recurringBillsPage.sortBy('Latest')
	await expect(recurringBillsPage.recurringBills()).toContainText([
		upcomingBill.Counterparty.name,
		soonBill.Counterparty.name,
		paidBill.Counterparty.name,
	])
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

	definition(term: string) {
		return this.page
			.getByTestId('definitionListItem')
			.filter({
				has: this.page.getByRole('term').getByText(term),
			})
			.getByRole('definition')
	}

	totalPaid() {
		return this.definition('Total Paid')
	}
	totalUpcoming() {
		return this.definition('Total Upcoming')
	}
	dueSoon() {
		return this.definition('Due Soon')
	}

	async sortBy(sort: string) {
		await this.page.getByRole('button', { name: /sort by/i }).click()
		return this.page
			.getByRole('listbox', { name: /sort by/i })
			.getByRole('option', { name: sort })
			.click()
	}
}
