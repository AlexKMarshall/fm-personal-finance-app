import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { requireAuthCookie } from '~/auth.server'
import { Card } from '~/components/Card'
import { getTransactions } from '../_main.transactions/queries.server'
import { Link, useLoaderData } from '@remix-run/react'
import { List } from '../_main.transactions/Transactions'
import { formatCurrency, formatDate } from '~/utils/format'
import { Icon } from '~/components/Icon'
import {
	getLatestTransactionDate,
	getRecurringBills,
	getRecurringBillSummary,
} from '../_main.recurring-bills/queries'
import { Transaction } from '~/components/Transaction'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const { items: transactions } = await getTransactions({
		userId,
		page: 1,
		size: 5,
		sort: 'date:desc',
	})

	const formattedTransactions = transactions.map(
		({ id, Counterparty, amount, date }) => ({
			id,
			name: Counterparty.name,
			date: formatDate(date),
			amount: formatCurrency(amount),
			avatar: Counterparty.avatarUrl,
		}),
	)

	const latestTransactionDate = await getLatestTransactionDate(userId)
	const recurringBills = await getRecurringBills({
		userId,
		currentDate: latestTransactionDate,
	})
	const recurringBillSummary = await getRecurringBillSummary(recurringBills)

	return json({
		transactions: formattedTransactions,
		recurringBills: {
			paid: formatCurrency(recurringBillSummary.paid.total),
			upcoming: formatCurrency(recurringBillSummary.upcoming.total),
			soon: formatCurrency(recurringBillSummary.soon.total),
		},
	})
}

export default function Overview() {
	const { transactions, recurringBills } = useLoaderData<typeof loader>()
	return (
		<>
			<h1 className="text-3xl font-bold leading-tight">Overview</h1>
			<Card theme="light" className="flex flex-col gap-8">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-xl font-bold leading-tight">Transactions</h2>
					<Link
						to="/transactions"
						className="flex items-center gap-3 text-xs text-gray-500"
					>
						View All
						<Icon name="CaretRight" className="size-2" />
					</Link>
				</div>
				<List
					items={transactions}
					renderItem={(transaction) => <Transaction {...transaction} />}
				/>
			</Card>
			<Card theme="light" className="flex flex-col gap-8">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-xl font-bold leading-tight">Recurring Bills</h2>
					<Link
						to="/recurring-bills"
						className="flex items-center gap-3 text-xs text-gray-500"
					>
						See Details
						<Icon name="CaretRight" className="size-2" />
					</Link>
				</div>
				<dl className="flex flex-col gap-3">
					<div
						className="flex items-center justify-between gap-4 rounded-lg border-l-4 border-l-green bg-beige-100 px-4 py-5"
						data-testid="definitionListItem"
					>
						<dt className="text-sm text-gray-500">Paid Bills</dt>
						<dd className="text-sm font-bold">{recurringBills.paid}</dd>
					</div>
					<div
						className="flex items-center justify-between gap-4 rounded-lg border-l-4 border-l-yellow bg-beige-100 px-4 py-5"
						data-testid="definitionListItem"
					>
						<dt className="text-sm text-gray-500">Total Upcoming</dt>
						<dd className="text-sm font-bold">{recurringBills.upcoming}</dd>
					</div>
					<div
						className="flex items-center justify-between gap-4 rounded-lg border-l-4 border-l-cyan bg-beige-100 px-4 py-5"
						data-testid="definitionListItem"
					>
						<dt className="text-sm text-gray-500">Due Soon</dt>
						<dd className="text-sm font-bold">{recurringBills.soon}</dd>
					</div>
				</dl>
			</Card>
		</>
	)
}
