import type { Meta, StoryObj } from '@storybook/react'

import { Input as InputComponent } from './Input'

const meta = {
	title: 'Input',
	component: InputComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof InputComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const Filled: Story = {
	args: {
		value: 'Filled',
	},
}
