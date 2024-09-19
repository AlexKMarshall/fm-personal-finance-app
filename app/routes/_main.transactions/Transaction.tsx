import clsx from 'clsx'
import { type ComponentProps } from 'react'

export function Transactions({
	transactions,
}: {
	transactions: Array<ComponentProps<typeof Transaction> & { id: string }>
}) {
	return (
		<ul>
			{transactions.map((transaction) => (
				<li
					className="mb-4 border-b border-gray-100 pb-4 last:mb-0 last:border-b-0 last:pb-0"
					key={transaction.id}
				>
					<Transaction {...transaction} />
				</li>
			))}
		</ul>
	)
}

export function Transaction({
	name,
	category,
	date,
	amount,
	avatar,
}: {
	name: string
	category: string
	date: string
	amount: string
	avatar: string
}) {
	const direction = amount.startsWith('-') ? 'debit' : 'credit'
	return (
		<div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 [grid-template-areas:'avatar_name_amount'_'avatar_category_date']">
			<img
				src={avatar}
				alt=""
				className="size-8 self-center rounded-full [grid-area:avatar]"
			/>
			<p className="text-sm font-bold leading-normal [grid-area:name]">
				{name}
			</p>
			<p className="text-xs leading-normal text-gray-500 [grid-area:category]">
				{category}
			</p>
			<p
				className={clsx(
					'justify-self-end text-sm font-bold leading-normal [grid-area:amount]',
					{
						'text-green': direction === 'credit',
					},
				)}
			>
				{amount}
			</p>
			<p className="justify-self-end text-xs leading-normal text-gray-500 [grid-area:date]">
				{date}
			</p>
		</div>
	)
}
