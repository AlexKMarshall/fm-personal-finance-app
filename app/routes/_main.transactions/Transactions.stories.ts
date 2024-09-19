import type { Meta, StoryObj } from '@storybook/react'

import { Transactions as TransactionsComponent } from './Transaction'
import serenitySpaAndWellness from '../../assets/story-assets/serenity-spa-and-wellness.jpg'
import flavorFiesta from '../../assets/story-assets/flavor-fiesta.jpg'
import masonMartinez from '../../assets/story-assets/mason-martinez.jpg'
import { allModes } from '.storybook/modes'

const meta = {
	title: 'Transactions',
	component: TransactionsComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
		chromatic: {
			modes: allModes,
		},
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof TransactionsComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Transactions: Story = {
	args: {
		transactions: [
			{
				id: '1',
				name: 'Serenity Spa & Wellness',
				category: 'Personal Care',
				date: '29 Aug 2024',
				amount: '-$25.00',
				avatar: serenitySpaAndWellness,
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
		],
	},
}
