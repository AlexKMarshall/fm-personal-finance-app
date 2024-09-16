import type { Meta, StoryObj } from '@storybook/react'

import { Label as LabelComponent } from './Label'

const meta = {
	title: 'Label',
	component: LabelComponent,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof LabelComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Label: Story = {
	args: {
		children: 'Field label',
	},
}
