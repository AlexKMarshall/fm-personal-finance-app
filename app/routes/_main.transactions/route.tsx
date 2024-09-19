import { useLoaderData } from '@remix-run/react'

import { Transactions } from './Transactions'
import { Card } from '~/components/Card'
import { prisma } from '~/db/prisma.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireAuthCookie } from '~/auth.server'
import { format } from 'date-fns'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)
	const transactions = await getTransactions({ userId })

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	})

	return transactions.map(({ id, Counterparty, Category, amount, date }) => ({
		id,
		name: Counterparty.name,
		category: Category.name,
		date: format(new Date(date), 'd MMMM yyyy'),
		amount: currencyFormatter.format(amount / 100),
		avatar: Counterparty.avatarUrl,
	}))
}

export default function TransactionsRoute() {
	const transactions = useLoaderData<typeof loader>()
	return (
		<>
			<h1 className="text-3xl font-bold leading-relaxed">Transactions</h1>
			<Card>
				<Transactions transactions={transactions} />
			</Card>
		</>
	)
}

function getTransactions({ userId }: { userId: string }) {
	return prisma.transaction.findMany({
		where: {
			userId,
		},
		select: {
			id: true,
			Counterparty: {
				select: {
					name: true,
					avatarUrl: true,
				},
			},
			amount: true,
			date: true,
			Category: {
				select: {
					name: true,
				},
			},
		},
	})
}
