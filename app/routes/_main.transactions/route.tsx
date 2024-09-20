import {
	Select,
	Button as RACButton,
	SelectValue,
	Popover,
	ListBox,
	ListBoxItem,
} from 'react-aria-components'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'

import { Transactions } from './Transactions'
import { Card } from '~/components/Card'
import { prisma } from '~/db/prisma.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireAuthCookie } from '~/auth.server'
import { formatCurrency, formatDate } from '~/utils/format'
import { Label } from '~/components/Label'
import { z } from 'zod'
import {
	getFormProps,
	useForm,
	useInputControl,
	type FieldMetadata,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useRef, type ComponentProps } from 'react'
import { Icon } from '~/components/Icon'
import { tv } from 'tailwind-variants'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const searchParams = new URL(request.url).searchParams

	const submission = parseWithZod(searchParams, { schema: filterSchema })
	if (submission.status !== 'success') {
		console.error(submission.error)
		throw new Error('Invalid search params')
	}

	const [transactions, categories] = await Promise.all([
		getTransactions({ userId, category: submission.value.category }),
		getCategories({ userId }),
	])

	const formattedTransactions = transactions.map(
		({ id, Counterparty, Category, amount, date }) => ({
			id,
			name: Counterparty.name,
			category: Category.name,
			date: formatDate(date),
			amount: formatCurrency(amount),
			avatar: Counterparty.avatarUrl,
		}),
	)

	return {
		transactions: formattedTransactions,
		categories: [
			{ id: '', name: 'All Transactions', value: '' },
			...categories.map(({ id, name }) => ({
				id,
				name,
				value: name.toLocaleLowerCase(),
			})),
		],
		selectedCategory: submission.value.category,
	}
}

const filterSchema = z.object({
	category: z.string().optional(),
})

export default function TransactionsRoute() {
	const { transactions, categories, selectedCategory } =
		useLoaderData<typeof loader>()
	const formRef = useRef<HTMLFormElement>(null)
	const submit = useSubmit()
	return (
		<>
			<h1 className="text-3xl font-bold leading-relaxed">Transactions</h1>
			<Card>
				<Form ref={formRef} replace className="mb-6 flex justify-end">
					<Select
						className="flex items-center gap-2"
						name="category"
						defaultSelectedKey={selectedCategory ?? ''}
						aria-labelledby="category-label"
						onSelectionChange={(value) => {
							if (!formRef.current) {
								return
							}
							const formData = new FormData(formRef.current!)
							if (!value) {
								formData.delete('category')
							} else {
								formData.set('category', String(value))
							}

							submit(formData, { replace: true })
						}}
					>
						<Label
							className="sr-only text-sm font-normal sm:not-sr-only"
							htmlFor="category"
							id="category-label"
						>
							Category
						</Label>
						<RACButton className="flex items-center justify-between gap-4 rounded-lg text-sm sm:w-48 sm:border sm:border-beige-500 sm:px-5 sm:py-3">
							<SelectValue>
								{({ isPlaceholder, defaultChildren }) => (
									<>
										<Icon name="Filter" className="size-5 sm:hidden" />
										<span className="sr-only sm:not-sr-only">
											{isPlaceholder ? 'All Transactions' : defaultChildren}
										</span>
									</>
								)}
							</SelectValue>
							<Icon name="CaretDown" className="hidden size-4 sm:block" />
						</RACButton>
						<Popover>
							<ListBox
								items={categories}
								className="max-h-80 w-48 overflow-y-auto rounded-lg bg-white px-5 py-3 shadow-lg"
							>
								{(item) => (
									<ListBoxItem
										id={item.value}
										className="cursor-pointer border-b border-gray-100 py-3 text-sm leading-normal outline-offset-1 first:pt-0 first:font-bold last:border-0 last:pb-0"
									>
										{item.name}
									</ListBoxItem>
								)}
							</ListBox>
						</Popover>
					</Select>
				</Form>
				<Transactions transactions={transactions} />
			</Card>
		</>
	)
}

function getTransactions({
	userId,
	category,
}: {
	userId: string
	category?: string
}) {
	return prisma.transaction
		.findMany({
			where: {
				userId,
			},
			select: {
				id: true,
				Counterparty: {
					select: {
						name: true,
						avatarUrl: true,
					},
				},
				amount: true,
				date: true,
				Category: {
					select: {
						name: true,
					},
				},
			},
		})
		.then(
			// Filter in memory as SQLite/Prisma doesn't support case-insensitive filtering
			// The data sets should be small enough for this to be acceptably fast
			(transactions) =>
				transactions.filter((transaction) =>
					category
						? transaction.Category.name.toLocaleLowerCase() ===
							category.toLocaleLowerCase()
						: true,
				),
		)
}

function getCategories({ userId }: { userId: string }) {
	return prisma.category.findMany({
		where: {
			Transactions: {
				some: {
					userId,
				},
			},
		},
		orderBy: {
			name: 'asc',
		},
	})
}

function WrapperSelect({
	meta,
	children,
	className,
	...props
}: ComponentProps<typeof Select> & { meta: FieldMetadata<string> }) {
	return (
		<Select {...props}>
			{(renderProps) => (
				<>
					<Label
						className="sr-only text-sm font-normal sm:not-sr-only"
						htmlFor="category"
						id="category-label"
					>
						Category
					</Label>
					<RACButton className="flex w-48 items-center justify-between gap-4 rounded-lg border border-beige-500 px-5 py-3 text-sm">
						<SelectValue>
							{({ isPlaceholder, defaultChildren }) =>
								isPlaceholder ? 'All Transactions' : defaultChildren
							}
						</SelectValue>
						<Icon name="CaretDown" className="size-4" />
					</RACButton>
					<Popover>
						{typeof children === 'function' ? children(renderProps) : children}
					</Popover>
				</>
			)}
		</Select>
	)
}
