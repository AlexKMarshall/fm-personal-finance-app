import clsx from 'clsx'
import { type ComponentProps, type ReactNode } from 'react'
import { tv } from 'tailwind-variants'

export function Transactions({
	transactions,
	className,
}: {
	transactions: Array<ComponentProps<typeof Transaction> & { id: string }>
	className?: string
}) {
	return (
		<div className={className}>
			<TransactionsTable
				transactions={transactions}
				className="hidden sm:table"
			/>
			<List
				items={transactions}
				className="sm:hidden"
				renderItem={(transaction) => <Transaction {...transaction} />}
				testId="transactions-mobile"
			/>
		</div>
	)
}

const transactionsTableStyles = tv({
	base: 'w-full table-fixed',
})

function TransactionsTable({
	className,
	transactions,
}: {
	className?: string
	transactions: Array<ComponentProps<typeof Transaction> & { id: string }>
}) {
	return (
		<table
			className={transactionsTableStyles({ className })}
			data-testid="transactions"
		>
			<thead>
				<tr className="border-b border-gray-100">
					<th className="w-1/2 py-3 pl-4 text-left text-xs font-normal text-gray-500">
						Recipient / Sender
					</th>
					<th className="text-left text-xs font-normal text-gray-500">
						Category
					</th>
					<th className="text-left text-xs font-normal text-gray-500">
						Transaction Date
					</th>
					<th className="pr-4 text-right text-xs font-normal text-gray-500">
						Amount
					</th>
				</tr>
			</thead>
			<tbody>
				{transactions.map((transaction) => {
					const direction = transaction.amount.startsWith('-')
						? 'debit'
						: 'credit'
					return (
						<tr
							key={transaction.id}
							className="border-b border-gray-100 last:border-b-0"
						>
							<td className="py-4 pl-4 first:pt-6 last:pb-0">
								<div className="flex items-center gap-4 text-sm font-bold">
									<img
										src={transaction.avatar}
										alt=""
										className="size-10 rounded-full"
									/>
									{transaction.name}
								</div>
							</td>
							<td className="text-xs text-gray-500">{transaction.category}</td>
							<td className="whitespace-nowrap text-xs text-gray-500">
								{transaction.date}
							</td>
							<td
								className={clsx('pr-4 text-right text-sm font-bold', {
									'text-green': direction === 'credit',
								})}
							>
								{transaction.amount}
							</td>
						</tr>
					)
				})}
			</tbody>
		</table>
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
		<div className="grid grid-cols-[2rem_1fr_auto] gap-x-3 gap-y-1 [grid-template-areas:'avatar_name_amount'_'avatar_category_date']">
			<img
				src={avatar}
				alt=""
				className="size-8 shrink-0 self-center rounded-full [grid-area:avatar]"
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

export function TransactionCardSimple({
	name,
	date,
	amount,
	avatar,
}: {
	name: string
	date: string
	amount: string
	avatar: string
}) {
	const direction = amount.startsWith('-') ? 'debit' : 'credit'
	return (
		<div className="grid grid-cols-[2rem_1fr_auto] items-center gap-x-3 gap-y-1 [grid-template-areas:'avatar_name_amount'_'avatar_name_date']">
			<img
				src={avatar}
				alt=""
				className="size-8 shrink-0 self-center rounded-full [grid-area:avatar]"
			/>
			<p className="text-sm font-bold leading-normal [grid-area:name]">
				{name}
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

export function List<ItemType extends { id: string }>({
	className,
	items,
	renderItem,
	testId,
}: {
	className?: string
	items: Array<ItemType>
	renderItem: (item: ItemType) => ReactNode
	testId?: string
}) {
	return (
		<ul className={className} data-testid={testId}>
			{items.map((item) => (
				<li
					className="border-b border-gray-100 pb-4 pt-4 first:pt-0 last:border-b-0 last:pb-0"
					key={item.id}
				>
					{renderItem(item)}
				</li>
			))}
		</ul>
	)
}
