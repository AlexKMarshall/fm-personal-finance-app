import type { Meta, StoryObj } from '@storybook/react'

import {
	SelectField as SelectFieldComponent,
	SelectOption,
	SelectOptions,
	SelectTrigger,
	SelectValue,
} from './SelectField'
import { Label } from './Label'
import { within } from '@storybook/test'

const meta = {
	title: 'SelectField',
	component: SelectFieldComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	decorators: [
		(Story) => (
			<div className="min-h-screen">
				<Story />
			</div>
		),
	],
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof SelectFieldComponent>

export default meta
type Story = StoryObj<typeof meta>

export const SelectField: Story = {
	args: {},
	render: (args) => (
		<SelectFieldComponent {...args}>
			<Label>Pet</Label>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectOptions>
				<SelectOption>Cat</SelectOption>
				<SelectOption>Dog</SelectOption>
				<SelectOption>Fish</SelectOption>
			</SelectOptions>
		</SelectFieldComponent>
	),
	play: async ({ canvasElement }) => {
		const page = within(canvasElement.parentElement!)

		const trigger = page.getByRole('button', { name: /pet/i })
		trigger.click()
	},
}
