import clsx from 'clsx'
import { type ComponentProps } from 'react'
import { tv } from 'tailwind-variants'
import { Icon } from '~/components/Icon'

export function RecurringBills({
	recurringBills,
	className,
}: {
	recurringBills: Array<ComponentProps<typeof RecurringBill> & { id: string }>
	className?: string
}) {
	return (
		<div className={className}>
			<RecurringBillsTable
				recurringBills={recurringBills}
				className="max-sm:hidden"
			/>
			<RecurringBillsList
				recurringBills={recurringBills}
				className="sm:hidden"
			/>
		</div>
	)
}

const transactionsTableStyles = tv({
	base: 'w-full table-fixed',
})

function RecurringBillsTable({
	className,
	recurringBills,
}: {
	className?: string
	recurringBills: Array<ComponentProps<typeof RecurringBill> & { id: string }>
}) {
	return (
		<table
			className={transactionsTableStyles({ className })}
			data-testid="recurring-bills"
		>
			<thead>
				<tr className="border-b border-gray-100">
					<th className="w-1/2 py-3 pl-4 text-left text-xs font-normal text-gray-500">
						Bill Title
					</th>
					<th className="text-left text-xs font-normal text-gray-500">
						Due Date
					</th>
					<th className="pr-4 text-right text-xs font-normal text-gray-500">
						Amount
					</th>
				</tr>
			</thead>
			<tbody>
				{recurringBills.map((transaction) => {
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
							<td className="whitespace-nowrap text-xs text-green">
								<span className="flex gap-2">
									{transaction.date}
									<BillStatusIcon status={transaction.status} />
								</span>
							</td>
							<td
								className={clsx('pr-4 text-right text-sm font-bold', {
									'text-red':
										transaction.status === 'overdue' ||
										transaction.status === 'soon',
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

export function RecurringBillsList({
	className,
	recurringBills,
}: {
	className?: string
	recurringBills: Array<ComponentProps<typeof RecurringBill> & { id: string }>
}) {
	return (
		<ul className={className} data-testid="recurring-bills-mobile">
			{recurringBills.map((transaction) => (
				<li
					className="mb-4 border-b border-gray-100 pb-4 last:mb-0 last:border-b-0 last:pb-0"
					key={transaction.id}
				>
					<RecurringBill {...transaction} />
				</li>
			))}
		</ul>
	)
}

export function RecurringBill({
	name,
	date,
	amount,
	avatar,
	status,
}: {
	name: string
	date: string
	amount: string
	avatar: string
	status: 'paid' | 'overdue' | 'soon' | 'upcoming'
}) {
	return (
		<div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 [grid-template-areas:'avatar_name_name'_'date_date_amount']">
			<img
				src={avatar}
				alt=""
				className="size-8 shrink-0 self-center rounded-full [grid-area:avatar]"
			/>
			<p className="text-sm font-bold leading-normal [grid-area:name]">
				{name}
			</p>
			<p className="flex gap-2 text-xs leading-normal text-green [grid-area:date]">
				{date} <BillStatusIcon status={status} />
			</p>
			<p
				className={clsx(
					'justify-self-end text-sm font-bold leading-normal [grid-area:amount]',
					{
						'text-red': status === 'overdue' || status === 'soon',
					},
				)}
			>
				{amount}
			</p>
		</div>
	)
}

function BillStatusIcon({
	status,
}: {
	status: 'paid' | 'overdue' | 'soon' | 'upcoming'
}) {
	if (status === 'paid') {
		return <Icon name="Check" className="size-4 text-green" />
	}
	if (status === 'overdue' || status === 'soon') {
		return <Icon name="Exclamation" className="size-4 text-red" />
	}

	return null
}
