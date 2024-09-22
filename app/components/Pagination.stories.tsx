import type { Meta, StoryObj } from '@storybook/react'

import { Pagination as PaginationComponent } from './Pagination'
import { createRemixStub } from '@remix-run/testing'
import { allModes } from '.storybook/modes'

const meta = {
	title: 'Pagination',
	component: PaginationComponent,
	parameters: {
		chromatic: {
			modes: allModes,
		},
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	decorators: [
		(Story, { args }) => {
			const RemixStub = createRemixStub([
				{
					path: '/*',
					action: () => ({ redirect: '/' }),
					loader: () => ({ redirect: '/' }),
					Component() {
						return <Story />
					},
				},
			])

			const totalPages = args.total / 10
			const middlePage = Math.floor(totalPages / 2)

			return <RemixStub initialEntries={[`/overview?page=${middlePage}`]} />
		},
	],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof PaginationComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Pagination: Story = {
	args: {
		total: 50,
	},
}

export const WithMorePages: Story = {
	args: {
		total: 100,
	},
}
