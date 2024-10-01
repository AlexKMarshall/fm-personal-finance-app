import type { Meta, StoryObj } from '@storybook/react'

import { Button as ButtonComponent } from './Button'

const meta = {
	title: 'Button',
	component: ButtonComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof ButtonComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		appearance: 'primary',
		children: 'A button',
	},
}

export const Tertiary: Story = {
	args: {
		appearance: 'tertiary',
		children: 'A button',
	},
}

export const Destroy: Story = {
	args: {
		appearance: 'destroy',
		children: 'A button',
	},
}
