import type { Meta, StoryObj } from '@storybook/react'
import serenitySpaAndWellness from '~/assets/story-assets/serenity-spa-and-wellness.jpg'

import { Transaction as TransactionComponent } from './Transaction'

const meta = {
	title: 'Transaction',
	component: TransactionComponent,
	parameters: {},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof TransactionComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Transaction: Story = {
	args: {
		name: 'Serenity Spa & Wellness',
		category: 'Personal Care',
		date: '29 Aug 2024',
		amount: '-$25.00',
		avatar: serenitySpaAndWellness,
		showCategory: true,
	},
}

export const HiddenCategory: Story = {
	args: {
		name: 'Serenity Spa & Wellness',
		category: 'Personal Care',
		date: '29 Aug 2024',
		amount: '-$25.00',
		avatar: serenitySpaAndWellness,
		showCategory: false,
	},
}
