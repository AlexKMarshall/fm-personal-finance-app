import type { Meta, StoryObj } from '@storybook/react'
import { createRemixStub } from '@remix-run/testing'

import { Navigation as NavigationComponent, NavigationItem } from './Navigation'

const meta = {
	title: 'Navigation',
	component: NavigationComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		// layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
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
} satisfies Meta<typeof NavigationComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Navigation: Story = {
	args: {},
	render: (args) => (
		<NavigationComponent {...args}>
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
		</NavigationComponent>
	),
}
