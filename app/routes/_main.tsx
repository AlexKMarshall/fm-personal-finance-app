import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'
import { Navigation, NavigationItem } from '~/components/Navigation'
import { Sidebar } from '~/components/Sidebar'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAuthCookie(request)
	return null
}

export default function Main() {
	return (
		<div className="relative grid min-h-svh grid-cols-[auto_1fr] grid-rows-[1fr_auto] flex-col [grid-template-areas:'sidebar-desktop_main'_'empty_sidebar-mobile']">
			<Sidebar className="sticky top-0 hidden max-h-svh overflow-y-auto [grid-area:sidebar-desktop] lg:flex">
				<SiteNavigation />
			</Sidebar>
			<div className="flex flex-grow flex-col gap-8 px-4 py-6 [grid-area:main] sm:px-10 sm:py-8">
				<Outlet />
			</div>
			<Sidebar className="sticky bottom-0 mt-auto [grid-area:sidebar-mobile] lg:hidden">
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
