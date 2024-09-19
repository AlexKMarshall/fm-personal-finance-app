import type { Meta, StoryObj } from '@storybook/react'
import { createRemixStub } from '@remix-run/testing'

import { Sidebar as SidebarComponent } from './Sidebar'
import { Navigation, NavigationItem } from './Navigation'
import { allModes } from '.storybook/modes'

const meta = {
	title: 'Sidebar',
	component: SidebarComponent,
	parameters: {
		layout: 'fullscreen',
		chromatic: {
			modes: allModes,
		},
	},
	tags: ['autodocs'],
	decorators: [
		(Story) => {
			const RemixStub = createRemixStub([
				{
					path: '/*',
					action: () => ({ redirect: '/' }),
					loader: () => ({ redirect: '/' }),
					Component() {
						return <Story />
					},
				},
			])

			return <RemixStub initialEntries={['/overview']} />
		},
	],
} satisfies Meta<typeof SidebarComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Sidebar: Story = {
	render: () => (
		<SidebarComponent>
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
		</SidebarComponent>
	),
}
