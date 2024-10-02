import { formatCurrency } from '~/utils/format'
import { makeBudget } from './factories/budget'
import { makeCategory } from './factories/category'
import { makeTransaction } from './factories/transaction'
import { test, expect } from './playwright-utils'
import type { Page } from '@playwright/test'

test('viewing budgets', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const budgetOne = makeBudget({ amount: 500 * 100 })
	// The most recent 3 transactions are displayed but all transactions for this month count towards the total
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
		amount: 100 * 100,
		Category: budgetTwo.Category,
		date: new Date('2024-01-10'),
	})
	const budgetTwoTransactionTwo = makeTransaction({
		amount: 200 * 100,
		Category: budgetTwo.Category,
		date: new Date('2024-01-09'),
	})
	const budgetTwoTransactionThree = makeTransaction({
		amount: 300 * 100,
		Category: budgetTwo.Category,
		date: new Date('2023-12-08'),
	})
	const budgetTwoTransactionFour = makeTransaction({
		amount: 400 * 100,
		Category: budgetTwo.Category,
		date: new Date('2023-12-07'),
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

	await expect(budgetsPage.spent(budgetOne.Category.name)).toHaveText(
		'$1,000.00',
	)
	await expect(budgetsPage.free(budgetOne.Category.name)).toHaveText('$0.00')

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
	await expect(budgetsPage.spent(budgetTwo.Category.name)).toContainText(
		'$300.00',
	)
	await expect(budgetsPage.free(budgetTwo.Category.name)).toContainText(
		'$700.00',
	)
})

test('delete a budget', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const budget = makeBudget({ amount: 500 * 100 })
	await seedDatabase({ budgets: [budget], user })
	await login(user)

	const budgetsPage = new BudgetsPage(page)
	await budgetsPage.goto()

	const budgetUi = await budgetsPage.budget(budget.Category.name)
	await expect(budgetUi).toBeVisible()

	const confirmationDialog = await budgetsPage.delete(budget.Category.name)

	// We should see confirmation modal
	const confirmationDialogUI = await confirmationDialog.ui()
	await expect(confirmationDialogUI).toBeVisible()
	// Confirm the deletion
	await confirmationDialog.confirm()

	// We shouldn't see the confirmation modal
	await expect(confirmationDialogUI).toBeHidden()
	// Or the budget
	await expect(budgetUi).toBeHidden()
})
test('create a budget', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const categoryOne = makeCategory()
	const categoryTwo = makeCategory()
	const transactionOne = makeTransaction({ Category: categoryOne })
	const transactionTwo = makeTransaction({ Category: categoryTwo })
	await seedDatabase({ user, transactions: [transactionOne, transactionTwo] })
	await login(user)

	const budgetToCreate = makeBudget({ Category: categoryOne })

	const budgetsPage = new BudgetsPage(page)

	await budgetsPage.goto()

	const createBudgetDialog = await budgetsPage.addBudget()

	await createBudgetDialog.fill({
		category: budgetToCreate.Category.name,
		amountInDollars: budgetToCreate.amount / 100,
		color: budgetToCreate.Color.name,
	})
	await createBudgetDialog.submit()

	await expect(createBudgetDialog.ui()).toBeHidden()
	const budgetUi = await budgetsPage.budget(budgetToCreate.Category.name)
	await expect(budgetUi).toBeVisible()
	await expect(budgetUi).toContainText(
		`Maximum of ${formatCurrency(budgetToCreate.amount)}`,
	)
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

	spent(category: string) {
		return this.budget(category)
			.getByTestId('descriptionListItem')
			.filter({ has: this.page.getByRole('term').getByText('Spent') })
			.getByRole('definition')
	}
	free(category: string) {
		return this.budget(category)
			.getByTestId('descriptionListItem')
			.filter({ has: this.page.getByRole('term').getByText('Free') })
			.getByRole('definition')
	}

	async delete(category: string) {
		const budget = this.budget(category)
		await budget.getByRole('button', { name: 'actions' }).click()
		await this.page.getByRole('menuitem', { name: 'Delete Budget' }).click()

		return new DeleteConfirmationDialog(this.page)
	}

	transaction({ category, name }: { category: string; name: string }) {
		return this.budget(category).getByRole('listitem').filter({ hasText: name })
	}

	async addBudget() {
		await this.page.getByRole('button', { name: /add budget/i }).click()
		return new CreateBudgetDialog(this.page)
	}
}

class CreateBudgetDialog {
	constructor(private page: Page) {}

	ui() {
		return this.page.getByRole('dialog', { name: /add new budget/i })
	}

	async selectColor(color: string) {
		// open select
		await this.ui().getByRole('button', { name: /theme/i }).click()
		const listBox = await this.page.getByRole('listbox', { name: /theme/i })
		return listBox.getByRole('option', { name: color }).click()
	}

	async fill({
		category,
		amountInDollars,
		color,
	}: {
		category: string
		amountInDollars: number
		color: string
	}) {
		await this.ui()
			.getByRole('combobox', { name: /budget category/i })
			.selectOption({ label: category })
		await this.ui()
			.getByRole('textbox', { name: /maximum spend/i })
			.fill(String(amountInDollars))

		await this.selectColor(color)
	}

	submit() {
		return this.ui()
			.getByRole('button', { name: /add budget/i })
			.click()
	}
}

class DeleteConfirmationDialog {
	constructor(private page: Page) {}

	ui() {
		return this.page.getByRole('dialog', { name: /delete/i })
	}

	confirm() {
		return this.ui()
			.getByRole('button', { name: 'Yes, Confirm Deletion' })
			.click()
	}
}
