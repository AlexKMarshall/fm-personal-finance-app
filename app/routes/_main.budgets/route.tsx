import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import clsx from 'clsx'
import { requireAuthCookie } from '~/auth.server'
import { Card } from '~/components/Card'
import { prisma } from '~/db/prisma.server'
import { formatCurrency } from '~/utils/format'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const budgets = await getBudgets(userId)

	const formattedBudgets = budgets.map((budget) => ({
		id: budget.id,
		amount: formatCurrency(budget.amount),
		category: budget.Category.name,
		color: budget.Color.name,
	}))

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
					<div>
						<h3 className="text-sm text-gray-500">
							Maximum of {budget.amount}
						</h3>
					</div>
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

function getBudgets(userId: string) {
	return prisma.budget.findMany({
		where: {
			userId,
		},
		select: {
			id: true,
			amount: true,
			Category: {
				select: {
					name: true,
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
}
