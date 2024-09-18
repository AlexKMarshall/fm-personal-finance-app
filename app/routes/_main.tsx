import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'
import { Navigation, NavigationItem } from '~/components/Navigation'

export async function loader({ request }: LoaderFunctionArgs) {
	const { name } = await requireAuthCookie(request)

	return { name }
}

export default function Main() {
	const { name } = useLoaderData<typeof loader>()
	return (
		<div>
			<Outlet />
			<p>{name}</p>
			<Navigation>
				<NavigationItem to="/overview" icon="Overview">
					Overview
				</NavigationItem>
				<NavigationItem to="/transactions" icon="Transactions">
					Transactions
				</NavigationItem>
				<NavigationItem to="/budgets" icon="Budgets">
					Budgets
				</NavigationItem>
				<NavigationItem to="/pots" icon="Pots">
					Pots
				</NavigationItem>
				<NavigationItem to="/recurring-bills" icon="RecurringBills">
					Recurring Bills
				</NavigationItem>
			</Navigation>
		</div>
	)
}
