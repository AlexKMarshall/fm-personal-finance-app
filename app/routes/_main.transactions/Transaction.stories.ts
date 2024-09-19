import type { Meta, StoryObj } from '@storybook/react'

import { Transaction as TransactionComponent } from './Transaction'
import serenitySpaAndWellness from '../../assets/story-assets/serenity-spa-and-wellness.jpg'

const meta = {
	title: 'Transaction',
	component: TransactionComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof TransactionComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Debit: Story = {
	args: {
		name: 'Serenity Spa & Wellness',
		category: 'Personal Care',
		date: '29 Aug 2024',
		amount: '-$25.00',
		avatar: serenitySpaAndWellness,
	},
}

export const Credit: Story = {
	args: {
		name: 'Serenity Spa & Wellness',
		category: 'Personal Care',
		date: '29 Aug 2024',
		amount: '+$25.00',
		avatar: serenitySpaAndWellness,
	},
}
