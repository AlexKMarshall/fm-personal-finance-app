import type { Meta, StoryObj } from '@storybook/react'

import { Dialog as DialogComponent, DialogTrigger, Modal } from './Dialog'
import { Button } from './Button'
import type { ReactNode } from 'react'
import { allModes } from '.storybook/modes'
import { expect, within } from '@storybook/test'

function DialogTemplate({ children }: { children: ReactNode }) {
	return (
		<DialogTrigger>
			<Button appearance="primary">Open dialog</Button>
			<Modal isDismissable>
				<DialogComponent title="Add a budget">{children}</DialogComponent>
			</Modal>
		</DialogTrigger>
	)
}

const meta = {
	title: 'Dialog',
	component: DialogTemplate,
	parameters: {
		layout: 'fullscreen',
		chromatic: {
			modes: allModes,
		},
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
} satisfies Meta<typeof DialogTemplate>

export default meta
type Story = StoryObj<typeof meta>

export const Dialog: Story = {
	args: {
		children: 'Some content',
	},
	play: async ({ canvasElement }) => {
		// We're going to get the whole page here as the dialog is portalled, we know the parent won't be null
		const page = within(canvasElement.parentElement!)
		page.getByRole('button', { name: /open dialog/i }).click()

		expect(
			await page.findByRole('dialog', { name: /add a budget/i }),
		).toBeVisible()
	},
}
