import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'
import { Icon } from '~/components/Icon'

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
			<nav>
				<Link to="/overview">
					<Icon name="Overview" className="size-6 text-green" />
					<span className="sr-only">Overview</span>
				</Link>
				<Link to="/transactions">
					<Icon name="Transactions" className="size-6" />
					<span className="sr-only">Transactions</span>
				</Link>
				<Link to="/budgets">
					<Icon name="Budgets" className="size-6" />
					<span className="sr-only">Budgets</span>
				</Link>
				<Link to="/pots">
					<Icon name="Pots" className="size-6" />
					<span className="sr-only">Pots</span>
				</Link>
				<Link to="/recurring-bills">
					<Icon name="RecurringBills" className="size-6" />
					<span className="sr-only">Recurring Bills</span>
				</Link>
			</nav>
		</div>
	)
}
