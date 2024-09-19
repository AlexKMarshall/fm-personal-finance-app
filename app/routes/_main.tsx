import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'
import { Navigation, NavigationItem } from '~/components/Navigation'
import { Sidebar } from '~/components/Sidebar'

export async function loader({ request }: LoaderFunctionArgs) {
	const { name } = await requireAuthCookie(request)

	return { name }
}

export default function Main() {
	const { name } = useLoaderData<typeof loader>()
	return (
		<div className="grid min-h-svh grid-cols-[auto_1fr] grid-rows-[1fr_auto] flex-col [grid-template-areas:'sidebar-desktop_main'_'empty_sidebar-mobile']">
			<Sidebar className="hidden [grid-area:sidebar-desktop] lg:flex">
				<SiteNavigation />
			</Sidebar>
			<div className="flex-grow [grid-area:main]">
				<Outlet />
				<p>{name}</p>
			</div>
			<Sidebar className="mt-auto [grid-area:sidebar-mobile] lg:hidden">
				<SiteNavigation />
			</Sidebar>
		</div>
	)
}

function SiteNavigation() {
	return (
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
	)
}
