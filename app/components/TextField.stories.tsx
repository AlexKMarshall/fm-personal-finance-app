import type { Meta, StoryObj } from '@storybook/react'

import { TextField as TextFieldComponent } from './TextField'
import { Label } from './Label'
import { Input } from './Input'
import { expect, within } from '@storybook/test'
import { FieldDescription } from './FieldDescription'

const meta = {
	title: 'TextField',
	component: TextFieldComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof TextFieldComponent>

export default meta
type Story = StoryObj<typeof meta>

export const TextField: Story = {
	args: {
		id: 'field-id',
		descriptionId: 'description-id',
	},
	render: (args) => (
		<TextFieldComponent {...args}>
			<Label>Field label</Label>
			<Input />
			<FieldDescription>Some description</FieldDescription>
		</TextFieldComponent>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const input = canvas.getByRole('textbox', { name: 'Field label' })

		await expect(input).toBeVisible()
		await expect(input).toHaveAccessibleDescription('Some description')
	},
}
