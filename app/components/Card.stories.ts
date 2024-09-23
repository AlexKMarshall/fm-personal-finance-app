import type { Meta, StoryObj } from '@storybook/react'

import { Card as CardComponent } from './Card'

const meta = {
	title: 'Card',
	component: CardComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof CardComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Card: Story = {
	args: {
		children: 'Some content',
		theme: 'light',
	},
}

export const DarkCard: Story = {
	args: {
		children: 'Some content',
		theme: 'dark',
	},
}
