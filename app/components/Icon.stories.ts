import type { Meta, StoryObj } from '@storybook/react'

import { Icon as IconComponent } from './Icon'
import type { ComponentProps } from 'react'

const meta = {
	title: 'Icon',
	component: IconComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		name: {
			control: {
				type: 'select',
			},
			options: [
				'Overview',
				'Transactions',
				'Budgets',
				'Pots',
				'RecurringBills',
			] satisfies Array<ComponentProps<typeof IconComponent>['name']>,
		},
	},
	args: {
		className: 'size-6 text-gray-500',
	},
} satisfies Meta<typeof IconComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {
	args: {
		name: 'Overview',
	},
}
