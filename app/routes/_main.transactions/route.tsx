import { useLoaderData } from '@remix-run/react'
import serinitySpaAndWellness from '~/assets/story-assets/serenity-spa-and-wellness.jpg'
import flavorFiesta from '~/assets/story-assets/flavor-fiesta.jpg'
import masonMartinez from '~/assets/story-assets/mason-martinez.jpg'

import { Transactions } from './Transaction'
import { Card } from '~/components/Card'

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
		{
			id: '2',
			name: 'Flavor Fiesta',
			category: 'Dining',
			date: '15 Sep 2024',
			amount: '-$45.00',
			avatar: flavorFiesta,
		},
		{
			id: '3',
			name: 'Mason Martinez',
			category: 'Freelance',
			date: '01 Oct 2024',
			amount: '+$150.00',
			avatar: masonMartinez,
		},
	]
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
