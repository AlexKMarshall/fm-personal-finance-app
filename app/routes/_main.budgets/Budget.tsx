import { Link } from '@remix-run/react'
import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { tv } from 'tailwind-variants'
import { Card } from '~/components/Card'
import { ContextMenu } from '~/components/ContextMenu'
import { Icon } from '~/components/Icon'
import { Transaction } from '~/components/Transaction'
import { List } from '../_main.transactions/Transactions'
import { getColor } from '~/utils/color'

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
						className={`h-full rounded ${getColor(color).background}`}
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
				className: clsx(getColor(color).background, className),
			})}
			aria-hidden
		/>
	)
}
