import { Link } from '@remix-run/react'
import type { ComponentProps } from 'react'
import { Card } from '~/components/Card'
import { List } from '../_main.transactions/Transactions'
import { Icon } from '~/components/Icon'
import { Transaction } from '~/components/Transaction'
import { tv } from 'tailwind-variants'
import clsx from 'clsx'

export function Budget({
	id,
	color,
	category,
	amount,
	spentPercent,
	spent,
	free,
	recentTransactions,
}: {
	id: string
	color: string
	category: string
	amount: string
	spentPercent: number
	spent: string
	free: string
	recentTransactions: Array<
		{
			id: string
		} & ComponentProps<typeof Transaction>
	>
}) {
	return (
		<Card
			key={id}
			theme="light"
			className="flex flex-col gap-5"
			data-testid="budget"
		>
			<div className="flex items-center gap-4">
				<ColorIndicator color={color} shape="circle" />
				<h2 className="text-xl font-bold leading-tight">{category}</h2>
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="text-sm text-gray-500">Maximum of {amount}</h3>
				<div aria-hidden className="h-8 w-full rounded bg-beige-100 p-1">
					<div
						style={{ width: `${spentPercent}%` }}
						className={`h-full rounded ${getBackgroundColor(color)}`}
					/>
				</div>
				<dl className="grid grid-cols-2 gap-4">
					<div className="flex gap-4">
						<ColorIndicator color={color} shape="bar" />
						<div
							className="flex flex-col gap-1"
							data-testid="descriptionListItem"
						>
							<dt className="text-xs leading-normal text-gray-500">Spent</dt>
							<dd className="text-sm font-bold leading-normal">{spent}</dd>
						</div>
					</div>
					<div className="flex gap-4">
						<ColorIndicator color="Beige" shape="bar" />
						<div
							className="flex flex-col gap-1"
							data-testid="descriptionListItem"
						>
							<dt className="text-xs leading-normal text-gray-500">Free</dt>
							<dd className="text-sm font-bold leading-normal">{free}</dd>
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
							search: `?category=${category}`,
						}}
						className="flex items-center gap-3 text-sm text-gray-500"
					>
						See All
						<Icon name="CaretRight" className="size-2" />
					</Link>
				</div>
				<List
					items={recentTransactions}
					renderItem={(transaction) => <Transaction {...transaction} />}
				/>
			</Card>
		</Card>
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
		case 'Beige':
			return 'bg-beige-100'
		default:
			return 'bg-gray-500'
	}
}

const colorIndicatorStyles = tv({
	variants: {
		shape: {
			circle: 'size-4 rounded-full',
			bar: 'w-1 rounded-lg',
		},
	},
})
export function ColorIndicator({
	color,
	shape,
	className,
}: {
	color: string
	shape: 'circle' | 'bar'
	className?: string
}) {
	return (
		<div
			className={colorIndicatorStyles({
				shape,
				className: clsx(getBackgroundColor(color), className),
			})}
			aria-hidden
		/>
	)
}
