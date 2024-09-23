import type { Meta, StoryObj } from '@storybook/react'

import { RecurringBills as RecurringBillsComponent } from './RecurringBills'
import serenitySpaAndWellness from '../../assets/story-assets/serenity-spa-and-wellness.jpg'
import flavorFiesta from '../../assets/story-assets/flavor-fiesta.jpg'
import masonMartinez from '../../assets/story-assets/mason-martinez.jpg'
import { allModes } from '.storybook/modes'

const meta = {
	title: 'RecurringBills',
	component: RecurringBillsComponent,
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
} satisfies Meta<typeof RecurringBillsComponent>

export default meta
type Story = StoryObj<typeof meta>

export const RecurringBills: Story = {
	args: {
		recurringBills: [
			{
				id: '1',
				name: 'Serenity Spa & Wellness',
				status: 'paid',
				date: 'Monthly - 3rd',
				amount: '$25.00',
				avatar: serenitySpaAndWellness,
			},
			{
				id: '2',
				name: 'Flavor Fiesta',
				date: 'Monthly - 5th',
				status: 'soon',
				amount: '$45.00',
				avatar: flavorFiesta,
			},
			{
				id: '3',
				name: 'Mason Martinez',
				date: 'Monthly - 23rd',
				amount: '$70.00',
				status: 'upcoming',
				avatar: masonMartinez,
			},
		],
	},
}
