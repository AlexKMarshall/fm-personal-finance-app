import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import clsx from 'clsx'
import { requireAuthCookie } from '~/auth.server'
import { Card } from '~/components/Card'
import { Icon } from '~/components/Icon'
import { prisma } from '~/db/prisma.server'
import { formatCurrency, formatDate } from '~/utils/format'
import { List } from '../_main.transactions/Transactions'
import { Transaction } from '~/components/Transaction'
import { isSameMonth } from 'date-fns'
import { getLatestTransactionDate } from '../_main.recurring-bills/recurring-bills.queries'

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
				<Card
					key={budget.id}
					theme="light"
					className="flex flex-col gap-5"
					data-testid="budget"
				>
					<div className="flex items-center gap-4">
						<ColorIndicator color={budget.color} />
						<h2 className="text-xl font-bold leading-tight">
							{budget.category}
						</h2>
					</div>
					<div className="flex flex-col gap-4">
						<h3 className="text-sm text-gray-500">
							Maximum of {budget.amount}
						</h3>
						<div aria-hidden className="h-8 w-full rounded bg-beige-100 p-1">
							<div
								style={{ width: `${budget.spentPercent}%` }}
								className={`h-full rounded ${getBackgroundColor(budget.color)}`}
							/>
						</div>
						<dl className="grid grid-cols-2 gap-4">
							<div className="flex gap-4">
								<span
									aria-hidden
									className={`h-full w-1 rounded-lg ${getBackgroundColor(budget.color)}`}
								/>
								<div
									className="flex flex-col gap-1"
									data-testid="definitionListItem"
								>
									<dt className="text-xs leading-normal text-gray-500">
										Spent
									</dt>
									<dd className="text-sm font-bold leading-normal">
										{budget.spent}
									</dd>
								</div>
							</div>
							<div className="flex gap-4">
								<span
									aria-hidden
									className="h-full w-1 rounded-lg bg-beige-100"
								/>
								<div
									className="flex flex-col gap-1"
									data-testid="definitionListItem"
								>
									<dt className="text-xs leading-normal text-gray-500">
										Spent
									</dt>
									<dd className="text-sm font-bold leading-normal">
										{budget.spent}
									</dd>
								</div>
							</div>
						</dl>
					</div>
					<Card theme="neutral" className="flex flex-col gap-5">
						<div className="flex items-center justify-between gap-4">
							<h3 className="font-bold">Latest Spending</h3>
							<Link
								to={{
									pathname: '/transactions',
									search: `?category=${budget.category}`,
								}}
								className="flex items-center gap-3 text-sm text-gray-500"
							>
								See All
								<Icon name="CaretRight" className="size-2" />
							</Link>
						</div>
						<List
							items={budget.recentTransactions}
							renderItem={(transaction) => <Transaction {...transaction} />}
						/>
					</Card>
				</Card>
			))}
		</>
	)
}

function getBackgroundColor(colorName: string) {
	switch (colorName) {
		case 'Green':
			return 'bg-green'
		case 'Yellow':
			return 'bg-yellow'
		case 'Cyan':
			return 'bg-cyan'
		case 'Navy':
			return 'bg-navy'
		case 'Red':
			return 'bg-red'
		case 'Purple':
			return 'bg-purple'
		case 'Pink':
			return 'bg-pink'
		case 'Turquoise':
			return 'bg-turquoise'
		case 'Brown':
			return 'bg-brown'
		case 'Magenta':
			return 'bg-magenta'
		case 'Blue':
			return 'bg-blue'
		case 'NavyGray':
			return 'bg-navyGray'
		case 'ArmyGreen':
			return 'bg-armyGreen'
		case 'Gold':
			return 'bg-gold'
		case 'Orange':
			return 'bg-orange'
		default:
			return 'bg-gray-500'
	}
}

function ColorIndicator({ color }: { color: string }) {
	return (
		<span
			className={clsx('size-4 rounded-full', getBackgroundColor(color))}
			aria-hidden
		/>
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
