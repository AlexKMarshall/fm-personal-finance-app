import { makeBudget } from './factories/budget'
import { test, expect } from './playwright-utils'
import type { Page } from '@playwright/test'

test('viewing budgets', async ({ page, signUp, login, seedDatabase }) => {
	const user = await signUp()
	const budgetOne = makeBudget({ amount: 500 * 100 })
	const budgetTwo = makeBudget({ amount: 1000 * 100 })
	await seedDatabase({ budgets: [budgetOne, budgetTwo], user })
	await login(user)

	const budgetsPage = new BudgetsPage(page)
	await budgetsPage.goto()

	const budgetOneUi = await budgetsPage.budget(budgetOne.Category.name)
	const budgetTwoUi = await budgetsPage.budget(budgetTwo.Category.name)

	await expect(budgetOneUi).toContainText(`Maximum of $500.00`)
	await expect(budgetTwoUi).toContainText(`Maximum of $1,000.00`)
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
}
