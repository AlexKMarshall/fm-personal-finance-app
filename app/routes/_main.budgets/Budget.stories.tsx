import type { Meta, StoryObj } from '@storybook/react'
import flavorFiesta from '~/assets/story-assets/flavor-fiesta.jpg'
import serenitySpaAndWellness from '~/assets/story-assets/serenity-spa-and-wellness.jpg'

import { Budget as BudgetComponent } from './Budget'
import { allModes } from '.storybook/modes'
import { createRemixStub } from '@remix-run/testing'

const meta = {
	title: 'Budget',
	component: BudgetComponent,
	parameters: {
		chromatic: {
			modes: allModes,
		},
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
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
} satisfies Meta<typeof BudgetComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Budget: Story = {
	args: {
		id: '1',
		color: 'green',
		category: 'Bills',
		amount: '$500.00',
		spentPercent: 75,
		spent: '$375.00',
		free: '$125.00',
		recentTransactions: [
			{
				id: '1',
				name: 'Serenity Spa & Wellness',
				date: '29 Aug 2024',
				amount: '-$375.00',
				avatar: serenitySpaAndWellness,
			},
			{
				id: '2',
				name: 'Flavor Fiesta',
				date: '1 Jul 2024',
				amount: '-$45.00',
				avatar: flavorFiesta,
			},
		],
		onDelete: () => void 0,
	},
}
