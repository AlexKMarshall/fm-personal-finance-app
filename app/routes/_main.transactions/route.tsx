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
import { parseWithZod } from '@conform-to/zod'
import { useRef } from 'react'
import { Icon } from '~/components/Icon'
import type { Prisma } from '@prisma/client'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const searchParams = new URL(request.url).searchParams

	const submission = parseWithZod(searchParams, { schema: filterSchema })
	if (submission.status !== 'success') {
		throw new Error('Invalid search params')
	}

	const [transactions, categories] = await Promise.all([
		getTransactions({
			userId,
			category: submission.value.category,
			sort: submission.value.sort,
		}),
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
		selectedSort: submission.value.sort,
	}
}

const sortKeys = [
	'date:desc',
	'date:asc',
	'name:asc',
	'name:desc',
	'amount:desc',
	'amount:asc',
] as const
type SortKey = (typeof sortKeys)[number]
const sortOptions = {
	'date:desc': 'Latest',
	'date:asc': 'Oldest',
	'name:asc': 'A to Z',
	'name:desc': 'Z to A',
	'amount:desc': 'Highest',
	'amount:asc': 'Lowest',
} satisfies Record<SortKey, string>

const filterSchema = z.object({
	category: z.string().optional(),
	sort: z.enum(sortKeys).optional().default('date:desc'),
})

export default function TransactionsRoute() {
	const { transactions, categories, selectedCategory, selectedSort } =
		useLoaderData<typeof loader>()
	const formRef = useRef<HTMLFormElement>(null)
	const submit = useSubmit()
	return (
		<>
			<h1 className="text-3xl font-bold leading-relaxed">Transactions</h1>
			<Card>
				<Form ref={formRef} replace className="mb-6 flex justify-end gap-6">
					<Select
						className="flex items-center gap-2"
						name="sort"
						defaultSelectedKey={selectedSort ?? 'latest'}
						aria-labelledby="sort-label"
						onSelectionChange={(value) => {
							if (!formRef.current) {
								return
							}
							const formData = new FormData(formRef.current!)
							if (!value) {
								formData.delete('sort')
							} else {
								formData.set('sort', String(value))
							}

							submit(formData, { replace: true })
						}}
					>
						<Label
							className="sr-only text-sm font-normal sm:not-sr-only"
							htmlFor="sort"
							id="sort-label"
						>
							Sort by
						</Label>
						<RACButton className="flex items-center justify-between gap-4 rounded-lg text-sm sm:w-48 sm:border sm:border-beige-500 sm:px-5 sm:py-3">
							<Icon name="Sort" className="size-5 sm:hidden" />
							<SelectValue className="sr-only sm:not-sr-only" />
							<Icon name="CaretDown" className="hidden size-4 sm:block" />
						</RACButton>
						<Popover>
							<ListBox
								items={Object.entries(sortOptions).map(([id, label]) => ({
									id,
									label,
								}))}
								className="max-h-80 w-48 overflow-y-auto rounded-lg bg-white px-5 py-3 shadow-[0px_4px_24px] shadow-black/25"
							>
								{(item) => (
									<ListBoxItem
										id={item.id}
										className="cursor-pointer border-b border-gray-100 py-3 text-sm leading-normal outline-offset-1 first:pt-0 last:border-0 last:pb-0 data-[selected]:font-bold"
									>
										{item.label}
									</ListBoxItem>
								)}
							</ListBox>
						</Popover>
					</Select>
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
								className="max-h-80 w-48 overflow-y-auto rounded-lg bg-white px-5 py-3 shadow-[0px_4px_24px] shadow-black/25"
							>
								{(item) => (
									<ListBoxItem
										id={item.value}
										className="cursor-pointer border-b border-gray-100 py-3 text-sm leading-normal outline-offset-1 first:pt-0 last:border-0 last:pb-0 data-[selected]:font-bold"
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
	sort = 'date:desc',
}: {
	userId: string
	category?: string
	sort?: SortKey
}) {
	function getTransactionOrderBy(
		sort: SortKey,
	): Prisma.TransactionOrderByWithRelationInput {
		switch (sort) {
			case 'date:desc':
				return { date: 'desc' }
			case 'date:asc':
				return { date: 'asc' }
			case 'name:asc':
				return { Counterparty: { name: 'asc' } }
			case 'name:desc':
				return { Counterparty: { name: 'desc' } }
			case 'amount:desc':
				return { amount: 'desc' }
			case 'amount:asc':
				return { amount: 'asc' }
		}
	}

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
			orderBy: getTransactionOrderBy(sort),
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
