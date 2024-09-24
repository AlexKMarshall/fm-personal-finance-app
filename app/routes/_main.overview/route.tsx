import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { requireAuthCookie } from '~/auth.server'
import { Card } from '~/components/Card'
import { getTransactions } from '../_main.transactions/queries.server'
import { Link, useLoaderData } from '@remix-run/react'
import { List, TransactionCardSimple } from '../_main.transactions/Transactions'
import { formatCurrency, formatDate } from '~/utils/format'
import { Icon } from '~/components/Icon'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const { items: transactions } = await getTransactions({
		userId,
		page: 1,
		size: 5,
		sort: 'date:desc',
	})

	const formattedTransactions = transactions.map(
		({ id, Counterparty, Category, amount, date }) => ({
			id,
			name: Counterparty.name,
			category: Category.name,
			date: formatDate(date),
			amount: formatCurrency(amount),
			avatar: Counterparty.avatarUrl,
		}),
	)

	return json({ transactions: formattedTransactions })
}

export default function Overview() {
	const { transactions } = useLoaderData<typeof loader>()
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
					renderItem={(transaction) => (
						<TransactionCardSimple {...transaction} />
					)}
				/>
			</Card>
		</>
	)
}
