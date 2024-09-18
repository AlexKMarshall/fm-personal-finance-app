import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'

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
				<Link to="/overview">Overview</Link>
				<Link to="/transactions">Transactions</Link>
				<Link to="/budgets">Budgets</Link>
				<Link to="/pots">Pots</Link>
				<Link to="/recurring-bills">Recurring bills</Link>
			</nav>
		</div>
	)
}
