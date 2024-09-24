import { matchSorter } from 'match-sorter'

import type { Prisma } from '@prisma/client'
import { prisma } from '~/db/prisma.server'
import { paginate } from '~/utils/pagination'

export const sortKeys = [
	'date:desc',
	'date:asc',
	'name:asc',
	'name:desc',
	'amount:desc',
	'amount:asc',
] as const
export type SortKey = (typeof sortKeys)[number]

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

export async function getTransactions({
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

export function getCategories({ userId }: { userId: string }) {
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
