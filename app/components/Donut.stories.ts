import type { Meta, StoryObj } from '@storybook/react'

import { Donut as DonutComponent } from './Donut'

const meta = {
	title: 'Donut',
	component: DonutComponent,
	parameters: {},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof DonutComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Label: Story = {
	args: {
		values: [
			{ id: '1', color: 'Green', value: 100, utilization: 0.5 },
			{ id: '2', color: 'Cyan', value: 200, utilization: 0.3 },
			{ id: '3', color: 'Pink', value: 500, utilization: 0.7 },
			{ id: '4', color: 'Yellow', value: 400, utilization: 1 },
		],
	},
}
