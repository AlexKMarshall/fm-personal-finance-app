import type { Meta, StoryObj } from '@storybook/react'

import { TextField as TextFieldComponent } from './TextField'
import { Label } from './Label'
import { Input } from './Input'
import { expect, within } from '@storybook/test'
import { FieldDescription } from './FieldDescription'
import { FieldError } from './FieldError'

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
	args: {},
	render: (args) => (
		<TextFieldComponent {...args}>
			<Label>Field label</Label>
			<Input />
			<FieldDescription>Some description</FieldDescription>
			<FieldError />
		</TextFieldComponent>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const input = canvas.getByRole('textbox', { name: 'Field label' })

		await expect(input).toBeVisible()
		await expect(input).toHaveAccessibleDescription('Some description')
	},
}

export const Invalid: Story = {
	args: { 'aria-invalid': true, errors: ['Error message'] },
	render: (args) => (
		<TextFieldComponent {...args}>
			<Label>Field label</Label>
			<Input />
			<FieldDescription>Some description</FieldDescription>
			{/* <FieldError /> */}
		</TextFieldComponent>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const input = canvas.getByRole('textbox', { name: 'Field label' })
		const error = canvas.getByRole('alert')

		await expect(input).toBeInvalid()
		await expect(error).toHaveTextContent('Error message')
		await expect(input).toHaveAccessibleDescription('Error message')
	},
}
