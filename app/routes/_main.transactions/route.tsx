import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import {
	ListBox,
	ListBoxItem,
	Popover,
	Button as RACButton,
	Select,
	SelectValue,
} from 'react-aria-components'

import { parseWithZod } from '@conform-to/zod'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useRef } from 'react'
import { z } from 'zod'
import { requireAuthCookie } from '~/auth.server'
import { Card } from '~/components/Card'
import { Icon } from '~/components/Icon'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { Pagination } from '~/components/Pagination'
import { formatCurrency, formatDate } from '~/utils/format'
import { Transactions } from './Transactions'
import {
	getCategories,
	getTransactions,
	type SortKey,
	sortKeys,
} from './queries.server'

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
			<h1 className="text-3xl font-bold leading-tight">Transactions</h1>
			<Card theme="light">
				<Form ref={formRef} replace className="mb-6 flex gap-6 @container">
					<Input
						type="search"
						name="search"
						placeholder="Search transaction"
						aria-label="Search transaction"
						className="mr-auto min-w-0 flex-shrink basis-80"
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
							className="sr-only text-sm font-normal @[38rem]:not-sr-only"
							htmlFor="sort"
							id="sort-label"
						>
							<span className="whitespace-nowrap">Sort by</span>
						</Label>
						<RACButton className="flex items-center justify-between gap-4 rounded-lg text-sm @[38rem]:w-32 @[38rem]:border @[38rem]:border-beige-500 @[38rem]:px-5 @[38rem]:py-3">
							<Icon name="Sort" className="size-5 @[38rem]:hidden" />
							<SelectValue className="sr-only @[38rem]:not-sr-only" />
							<Icon
								name="CaretDown"
								className="hidden size-4 group-data-[open]:rotate-180 @[38rem]:block"
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
							className="sr-only text-sm font-normal @[38rem]:not-sr-only"
							htmlFor="category"
							id="category-label"
						>
							Category
						</Label>
						<RACButton className="flex items-center justify-between gap-4 rounded-lg text-sm @[38rem]:w-48 @[38rem]:border @[38rem]:border-beige-500 @[38rem]:px-5 @[38rem]:py-3">
							<Icon name="Filter" className="size-5 @[38rem]:hidden" />
							<SelectValue className="sr-only @[38rem]:not-sr-only" />
							<Icon
								name="CaretDown"
								className="hidden size-4 group-data-[open]:rotate-180 @[38rem]:block"
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
