import { Link } from '@remix-run/react'
import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { tv } from 'tailwind-variants'
import { Card } from '~/components/Card'
import { ContextMenu } from '~/components/ContextMenu'
import { Icon } from '~/components/Icon'
import { Transaction } from '~/components/Transaction'
import { List } from '../_main.transactions/Transactions'

export function Budget({
	id,
	color,
	category,
	amount,
	spentPercent,
	spent,
	free,
	recentTransactions,
	onDelete,
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
	onDelete: () => void
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
				<ContextMenu aria-label="actions" className="ml-auto">
					<ContextMenu.Item className="text-red" onAction={onDelete}>
						Delete Budget
					</ContextMenu.Item>
				</ContextMenu>
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

export const colorMap: Record<
	string,
	{ background: string; foreground: string }
> = {
	Green: { background: 'bg-green', foreground: 'text-green' },
	Yellow: { background: 'bg-yellow', foreground: 'text-yellow' },
	Cyan: { background: 'bg-cyan', foreground: 'text-cyan' },
	Navy: { background: 'bg-navy', foreground: 'text-navy' },
	Red: { background: 'bg-red', foreground: 'text-red' },
	Purple: { background: 'bg-purple', foreground: 'text-purple' },
	Pink: { background: 'bg-pink', foreground: 'text-pink' },
	Turquoise: { background: 'bg-turquoise', foreground: 'text-turquoise' },
	Brown: { background: 'bg-brown', foreground: 'text-brown' },
	Magenta: { background: 'bg-magenta', foreground: 'text-magenta' },
	Blue: { background: 'bg-blue', foreground: 'text-blue' },
	NavyGray: { background: 'bg-navyGray', foreground: 'text-navyGray' },
	ArmyGreen: { background: 'bg-armyGreen', foreground: 'text-armyGreen' },
	Gold: { background: 'bg-gold', foreground: 'text-gold' },
	Orange: { background: 'bg-orange', foreground: 'text-orange' },
	Beige: { background: 'bg-beige-100', foreground: 'text-beige-100' },
}

export function getColor(colorName: string) {
	return (
		colorMap[colorName] ?? {
			background: 'bg-gray-500',
			foreground: 'text-gray-500',
		}
	)
}

function getBackgroundColor(colorName: string) {
	return getColor(colorName).background
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
