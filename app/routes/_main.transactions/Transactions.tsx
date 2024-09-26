import clsx from 'clsx'
import { type ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { Transaction } from '~/components/Transaction'

type TransactionUI = {
	id: string
	name: string
	avatar: string
	category: string
	date: string
	amount: string
}

export function Transactions({
	transactions,
	className,
}: {
	transactions: Array<TransactionUI>
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
				renderItem={(transaction) => (
					<Transaction {...transaction} showCategory />
				)}
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
	transactions: Array<TransactionUI>
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

const listStyles = tv({
	slots: {
		base: '',
		listItem:
			'border-b border-gray-500/15 pb-4 pt-4 first:pt-0 last:border-b-0 last:pb-0',
	},
})

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
	const styles = listStyles()
	return (
		<ul className={styles.base({ className })} data-testid={testId}>
			{items.map((item) => (
				<li className={styles.listItem()} key={item.id}>
					{renderItem(item)}
				</li>
			))}
		</ul>
	)
}
