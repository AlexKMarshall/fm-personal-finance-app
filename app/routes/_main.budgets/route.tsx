import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { isSameMonth } from 'date-fns'
import { requireAuthCookie } from '~/auth.server'
import { prisma } from '~/db/prisma.server'
import { formatCurrency, formatDate } from '~/utils/format'
import { getLatestTransactionDate } from '../_main.recurring-bills/recurring-bills.queries'
import { Budget } from './Budget'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)
	const currentDate = await getLatestTransactionDate(userId)

	const budgets = await getBudgets({ userId, currentDate })

	const formattedBudgets = budgets.map((budget) => {
		const spentPercent = Math.min(budget.spent / budget.amount, 1) * 100
		return {
			id: budget.id,
			amount: formatCurrency(budget.amount),
			category: budget.Category.name,
			color: budget.Color.name,
			spent: formatCurrency(budget.spent),
			spentPercent,
			free: formatCurrency(budget.free),
			recentTransactions: budget.Category.Transactions.slice(0, 3).map(
				(transaction) => ({
					id: transaction.id,
					amount: formatCurrency(transaction.amount),
					date: formatDate(transaction.date),
					name: transaction.Counterparty.name,
					avatar: transaction.Counterparty.avatarUrl,
				}),
			),
		}
	})

	return json({ budgets: formattedBudgets })
}

export default function BudgetsRoute() {
	const { budgets } = useLoaderData<typeof loader>()
	return (
		<>
			<h1 className="text-3xl font-bold leading-tight">Budgets</h1>
			{budgets.map((budget) => (
				<Budget {...budget} />
			))}
		</>
	)
}

async function getBudgets({
	userId,
	currentDate,
}: {
	userId: string
	currentDate: Date
}) {
	const budgets = await prisma.budget.findMany({
		where: {
			userId,
		},
		select: {
			id: true,
			amount: true,
			Category: {
				select: {
					name: true,
					Transactions: {
						where: {
							userId,
						},
						select: {
							id: true,
							Counterparty: {
								select: { name: true, avatarUrl: true },
							},
							amount: true,
							date: true,
						},
						orderBy: {
							date: 'desc',
						},
					},
				},
			},
			Color: {
				select: {
					name: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return budgets.map((budget) => {
		const currentMonthTransactions = budget.Category.Transactions.filter(
			(transaction) => isSameMonth(transaction.date, currentDate),
		)
		const spent = Math.abs(
			currentMonthTransactions.reduce(
				(total, transaction) => total + transaction.amount,
				0,
			),
		)
		const free = Math.max(budget.amount - spent, 0)
		return { ...budget, spent, free }
	})
}
