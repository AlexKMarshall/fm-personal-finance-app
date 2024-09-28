import { addDays, addMonths, isBefore, startOfMonth, subMonths } from 'date-fns'
import { prisma } from '~/db/prisma.server'

export async function getLatestTransactionDate(userId: string) {
	const latestTransaction = await prisma.transaction.findFirst({
		where: { userId },
		orderBy: { date: 'desc' },
	})
	return latestTransaction?.date ?? new Date()
}

export const sortKeys = [
	'date:desc',
	'date:asc',
	'name:asc',
	'name:desc',
	'amount:desc',
	'amount:asc',
] as const
export type SortKey = (typeof sortKeys)[number]

export async function getRecurringBills({
	userId,
	currentDate,
	sort = 'date:desc',
}: {
	userId: string
	currentDate: Date
	sort?: SortKey
}) {
	const startOfCurrentMonth = startOfMonth(currentDate)
	const thisMonthBills = await prisma.transaction.findMany({
		where: {
			userId,
			isRecurring: true,
			date: { gte: startOfCurrentMonth },
		},
		orderBy: { date: 'desc' },
		select: {
			id: true,
			Counterparty: { select: { name: true, avatarUrl: true } },
			amount: true,
			date: true,
		},
	})
	const startOfLastMonth = startOfMonth(subMonths(currentDate, 1))
	const lastMonthBills = await prisma.transaction.findMany({
		where: {
			userId,
			isRecurring: true,
			date: { gte: startOfLastMonth, lt: startOfCurrentMonth },
		},
		orderBy: { date: 'desc' },
		select: {
			id: true,
			Counterparty: { select: { name: true, avatarUrl: true } },
			amount: true,
			date: true,
		},
	})

	// The bills from last month that haven't appeared this month yet
	const expectedBills = lastMonthBills
		.filter(
			(lastMonthBill) =>
				!thisMonthBills.some(
					(thisMonthBill) =>
						thisMonthBill.Counterparty.name === lastMonthBill.Counterparty.name,
				),
		)
		.map((bill) => ({ ...bill, date: addMonths(bill.date, 1) }))

	// Expected bills can either be 'overdue', 'soon' or 'upcoming'
	// This month's bills are all 'paid'
	return [
		...thisMonthBills.map((bill) => ({ ...bill, status: 'paid' as const })),
		...expectedBills.map((bill) => {
			const status = getBillStatus({ billDate: bill.date, currentDate })
			return { ...bill, status }
		}),
	].sort((a, b) => {
		switch (sort) {
			case 'date:desc':
				return a.date > b.date ? -1 : 1
			case 'date:asc':
				return a.date < b.date ? -1 : 1
			case 'name:asc':
				return a.Counterparty.name.localeCompare(b.Counterparty.name)
			case 'name:desc':
				return b.Counterparty.name.localeCompare(a.Counterparty.name)
			case 'amount:desc':
				return Math.abs(a.amount) > Math.abs(b.amount) ? -1 : 1
			case 'amount:asc':
				return Math.abs(a.amount) < Math.abs(b.amount) ? -1 : 1
		}
	})
}

function getBillStatus({
	billDate,
	currentDate,
}: {
	billDate: Date
	currentDate: Date
}) {
	if (isBefore(billDate, currentDate)) {
		return 'overdue' as const
	}
	if (isBefore(billDate, addDays(currentDate, 5))) {
		return 'soon' as const
	}
	return 'upcoming' as const
}

function getTotalAndCount(bills: { amount: number }[]) {
	const total = bills.reduce((total, bill) => total + Math.abs(bill.amount), 0)
	const count = bills.length
	return { total, count }
}

export function getRecurringBillSummary(
	recurringBills: Awaited<ReturnType<typeof getRecurringBills>>,
) {
	const all = getTotalAndCount(recurringBills)
	const paid = getTotalAndCount(
		recurringBills.filter((bill) => bill.status === 'paid'),
	)
	const soon = getTotalAndCount(
		recurringBills.filter((bill) => bill.status === 'soon'),
	)
	const upcoming = getTotalAndCount(
		recurringBills.filter((bill) => bill.status === 'upcoming'),
	)
	return {
		all,
		paid,
		soon,
		upcoming,
	}
}
