import { Form, useLoaderData } from '@remix-run/react'

import { Transactions } from './Transactions'
import { Card } from '~/components/Card'
import { prisma } from '~/db/prisma.server'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireAuthCookie } from '~/auth.server'
import { formatCurrency, formatDate } from '~/utils/format'
import { Label } from '~/components/Label'
import { z } from 'zod'
import { getFormProps, getSelectProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

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
		categories,
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
					onChange={(event) => {
						event.currentTarget.requestSubmit()
					}}
				>
					<div className="flex gap-3">
						<Label className="sr-only sm:not-sr-only" htmlFor="category">
							Category
						</Label>
						<select {...getSelectProps(fields.category)} id="category">
							<option value="">All Transactions</option>
							{categories.map((category) => (
								<option
									key={category.id}
									value={category.name.toLocaleLowerCase()}
								>
									{category.name}
								</option>
							))}
						</select>
					</div>
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
