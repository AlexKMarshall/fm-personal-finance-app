import { matchSorter } from 'match-sorter'
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
import { Input } from '~/components/Input'
import { Pagination } from '~/components/Pagination'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const searchParams = new URL(request.url).searchParams

	const submission = parseWithZod(searchParams, { schema: filterSchema })
	if (submission.status !== 'success') {
		throw new Error('Invalid search params')
	}

	const { category, sort, search, page, size } = submission.value

	const [{ count, items: transactions }, categories] = await Promise.all([
		getTransactions({
			userId,
			category,
			sort,
			search,
			page,
			size,
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
		selectedCategory: category,
		selectedSort: sort,
		search,
		count,
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
	search: z.string().optional(),
	page: z.coerce.number().default(1),
	size: z.coerce.number().default(10),
})

export default function TransactionsRoute() {
	const {
		transactions,
		categories,
		selectedCategory,
		selectedSort,
		search,
		count,
	} = useLoaderData<typeof loader>()
	const formRef = useRef<HTMLFormElement>(null)
	const submit = useSubmit()
	return (
		<>
			<h1 className="text-3xl font-bold leading-relaxed">Transactions</h1>
			<Card>
				<Form ref={formRef} replace className="mb-6 flex flex-wrap gap-6">
					<Input
						type="search"
						name="search"
						placeholder="Search transaction"
						aria-label="Search transaction"
						className="mr-auto basis-80"
						defaultValue={search ?? ''}
						onChange={(event) => {
							if (!formRef.current) {
								return
							}
							const formData = new FormData(formRef.current)
							const search = event.currentTarget.value
							if (search) {
								formData.set('search', search)
							} else {
								formData.delete('search')
							}

							submit(formData, { replace: true })
						}}
					/>
					<Select
						className="group flex items-center gap-2"
						name="sort"
						defaultSelectedKey={selectedSort ?? 'date:desc'}
						aria-labelledby="sort-label"
						onSelectionChange={(value) => {
							if (!formRef.current) {
								return
							}
							const formData = new FormData(formRef.current)
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
						<RACButton className="flex items-center justify-between gap-4 rounded-lg text-sm sm:w-32 sm:border sm:border-beige-500 sm:px-5 sm:py-3">
							<Icon name="Sort" className="size-5 sm:hidden" />
							<SelectValue className="sr-only sm:not-sr-only" />
							<Icon
								name="CaretDown"
								className="hidden size-4 group-data-[open]:rotate-180 sm:block"
							/>
						</RACButton>
						<Popover>
							<ListBox
								items={Object.entries(sortOptions).map(([id, label]) => ({
									id,
									label,
								}))}
								className="max-h-80 w-32 overflow-y-auto rounded-lg bg-white px-5 py-3 shadow-[0px_4px_24px] shadow-black/25"
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
						className="group flex items-center gap-2"
						name="category"
						defaultSelectedKey={selectedCategory ?? ''}
						aria-labelledby="category-label"
						onSelectionChange={(value) => {
							if (!formRef.current) {
								return
							}
							const formData = new FormData(formRef.current)
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
							<Icon name="Filter" className="size-5 sm:hidden" />
							<SelectValue className="sr-only sm:not-sr-only" />
							<Icon
								name="CaretDown"
								className="hidden size-4 group-data-[open]:rotate-180 sm:block"
							/>
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
				<Transactions transactions={transactions} className="mb-12" />
				<Pagination total={count} />
			</Card>
		</>
	)
}

async function getTransactions({
	userId,
	category,
	sort = 'date:desc',
	search,
	page,
	size,
}: {
	userId: string
	category?: string
	sort?: SortKey
	search?: string
	page: number
	size: number
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

	const sortedTransactions = await prisma.transaction.findMany({
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
	const filteredTransactions = sortedTransactions.filter((transaction) =>
		category
			? transaction.Category.name.toLocaleLowerCase() ===
				category.toLocaleLowerCase()
			: true,
	)

	if (!search) {
		return paginate(filteredTransactions, { page, size })
	}

	const searchedTransactions = matchSorter(filteredTransactions, search, {
		keys: ['Counterparty.name'],
		baseSort: (a, b) => (a.index < b.index ? -1 : 1),
	})

	return paginate(searchedTransactions, { page, size })
}

function paginate<T>(
	items: T[],
	{ page, size }: { page: number; size: number },
) {
	const start = (page - 1) * size
	const end = start + size
	const paginatedItems = items.slice(start, end)

	return {
		items: paginatedItems,
		count: items.length,
	}
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
