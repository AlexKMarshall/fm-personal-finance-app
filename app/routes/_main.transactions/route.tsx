import {
	Select,
	Button as RACButton,
	SelectValue,
	Popover,
	ListBox,
	ListBoxItem,
} from 'react-aria-components'
import { Form, useLoaderData } from '@remix-run/react'

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
import type { ComponentProps } from 'react'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const searchParams = new URL(request.url).searchParams

	const submission = parseWithZod(searchParams, { schema: filterSchema })
	if (submission.status !== 'success') {
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
	}
}

const filterSchema = z.object({
	category: z.string().optional(),
})

export default function TransactionsRoute() {
	const { transactions, categories } = useLoaderData<typeof loader>()

	const [form, fields] = useForm({
		constraint: getZodConstraint(filterSchema),
		onValidate: ({ formData }) =>
			parseWithZod(formData, { schema: filterSchema }),
	})

	return (
		<>
			<h1 className="text-3xl font-bold leading-relaxed">Transactions</h1>
			<Card>
				<Form
					{...getFormProps(form)}
					replace
					onInput={(event) => {
						event.currentTarget.requestSubmit()
					}}
				>
					<WrapperSelect
						className="flex gap-3"
						meta={fields.category}
						aria-labelledby="category-label"
					>
						<ListBox items={categories} className="bg-white p-4">
							{(item) => <ListBoxItem id={item.value}>{item.name}</ListBoxItem>}
						</ListBox>
					</WrapperSelect>

					<button type="submit">Filter</button>
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
	...props
}: ComponentProps<typeof Select> & { meta: FieldMetadata<string> }) {
	const control = useInputControl(meta)

	return (
		<Select
			{...props}
			selectedKey={control.value}
			onSelectionChange={(value) => control.change(value as string)}
			onBlur={() => control.blur()}
			onFocus={() => control.focus()}
		>
			{(renderProps) => (
				<>
					<Label
						className="sr-only sm:not-sr-only"
						htmlFor="category"
						id="category-label"
					>
						Category
					</Label>
					<RACButton>
						<SelectValue />
					</RACButton>
					<Popover>
						{typeof children === 'function' ? children(renderProps) : children}
					</Popover>
				</>
			)}
		</Select>
	)
}
