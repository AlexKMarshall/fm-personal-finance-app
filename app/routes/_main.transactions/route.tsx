import { useLoaderData } from '@remix-run/react'
import serinitySpaAndWellness from '~/assets/story-assets/serenity-spa-and-wellness.jpg'
import { Transaction } from './Transaction'

export function loader() {
	return [
		{
			id: '1',
			name: 'Serenity Spa & Wellness',
			category: 'Personal Care',
			date: '29 Aug 2024',
			amount: '-$25.00',
			avatar: serinitySpaAndWellness,
		},
	]
}

export default function TransactionsRoute() {
	const transactions = useLoaderData<typeof loader>()
	return (
		<>
			<h1 className="text-3xl font-bold leading-relaxed">Transactions</h1>
			<div className="rounded-xl bg-white px-5 py-6 sm:p-8">
				{transactions.map((transaction) => (
					<Transaction key={transaction.id} {...transaction} />
				))}
			</div>
		</>
	)
}
