import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'
import { Card } from '~/components/Card'
import { prisma } from '~/db/prisma.server'
import { formatCurrency, formatDayOfMonth } from '~/utils/format'
import { RecurringBills } from './RecurringBills'
import { addDays, addMonths, isBefore, startOfMonth, subMonths } from 'date-fns'
import { Icon } from '~/components/Icon'
import { tv } from 'tailwind-variants'
import { useContext, createContext, type ReactNode } from 'react'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const currentDate = await getLatestTransactionDate(userId)

	const recurringBills = await getRecurringBills({ userId, currentDate })

	const formattedRecurringBills = recurringBills.map(
		({ id, Counterparty, amount, date, status }) => ({
			id,
			name: Counterparty.name,
			date: `Monthly - ${formatDayOfMonth(date)}`,
			amount: formatCurrency(Math.abs(amount)),
			avatar: Counterparty.avatarUrl,
			status,
		}),
	)

	const totalBills = formatCurrency(
		recurringBills.reduce((total, { amount }) => total + Math.abs(amount), 0),
	)
	const paidBills = {
		count: recurringBills.filter((bill) => bill.status === 'paid').length,
		total: formatCurrency(
			recurringBills
				.filter((bill) => bill.status === 'paid')
				.reduce((total, { amount }) => total + Math.abs(amount), 0),
		),
	}
	const upcomingBills = {
		count: recurringBills.filter((bill) => bill.status === 'upcoming').length,
		total: formatCurrency(
			recurringBills
				.filter((bill) => bill.status === 'upcoming')
				.reduce((total, { amount }) => total + Math.abs(amount), 0),
		),
	}
	const soonBills = {
		count: recurringBills.filter((bill) => bill.status === 'soon').length,
		total: formatCurrency(
			recurringBills
				.filter((bill) => bill.status === 'soon')
				.reduce((total, { amount }) => total + Math.abs(amount), 0),
		),
	}

	return json({
		recurringBills: formattedRecurringBills,
		totalBills,
		paidBills,
		upcomingBills,
		soonBills,
	})
}

export default function Overview() {
	const { recurringBills, totalBills, paidBills, upcomingBills, soonBills } =
		useLoaderData<typeof loader>()
	return (
		<>
			<h1 className="text-3xl font-bold leading-tight">Recurring Bills</h1>
			<Card
				theme="dark"
				className="flex items-center gap-5 sm:flex-col sm:items-start sm:justify-between sm:gap-8"
			>
				<Icon name="RecurringBillsOutline" className="size-10" />
				<div className="flex flex-col gap-3" data-testid="total-bills">
					<h2 id="total-bills" className="text-sm leading-normal">
						Total Bills
					</h2>
					<p className="text-3xl font-bold leading-tight">{totalBills}</p>
				</div>
			</Card>
			<Card theme="light">
				<h2 className="font-bold">Summary</h2>
				<dl>
					<SummaryItem>
						<SummaryItem.Title>Total Paid</SummaryItem.Title>
						<SummaryItem.Amount
							count={paidBills.count}
							total={paidBills.total}
						/>
					</SummaryItem>
					<SummaryItem>
						<SummaryItem.Title>Total Upcoming</SummaryItem.Title>
						<SummaryItem.Amount
							count={upcomingBills.count}
							total={upcomingBills.total}
						/>
					</SummaryItem>
					<SummaryItem color="red">
						<SummaryItem.Title>Due Soon</SummaryItem.Title>
						<SummaryItem.Amount
							count={soonBills.count}
							total={soonBills.total}
						/>
					</SummaryItem>
				</dl>
			</Card>
			<Card theme="light">
				<RecurringBills recurringBills={recurringBills} />
			</Card>
		</>
	)
}

const summaryItemStyles = tv({
	slots: {
		base: 'flex justify-between',
		title: 'text-xs',
		amount: 'text-xs font-bold',
	},
	variants: {
		color: {
			gray: {
				title: 'text-gray-500',
			},
			red: {
				title: 'text-red',
				amount: 'text-red',
			},
		},
	},
	defaultVariants: {
		color: 'gray',
	},
})

const SummaryItemContext = createContext<{ color: 'gray' | 'red' } | null>(null)
function useSummaryItemContext() {
	const context = useContext(SummaryItemContext)
	if (!context) {
		throw new Error('useSummaryItemContext must be used within a SummaryItem')
	}
	return context
}

function SummaryItem({
	className,
	color = 'gray',
	children,
}: {
	className?: string
	color?: 'gray' | 'red'
	children: ReactNode
}) {
	const styles = summaryItemStyles({ color })
	return (
		<SummaryItemContext.Provider value={{ color }}>
			<div
				className={styles.base({ className, color })}
				data-testid="definitionListItem"
			>
				{children}
			</div>
		</SummaryItemContext.Provider>
	)
}

function SummaryItemTitle({ children }: { children: ReactNode }) {
	const { color } = useSummaryItemContext()
	const styles = summaryItemStyles({ color })
	return <dt className={styles.title({ color })}>{children}</dt>
}
function SummaryItemAmount({ count, total }: { count: number; total: string }) {
	const { color } = useSummaryItemContext()
	const styles = summaryItemStyles({ color })
	return (
		<dd className={styles.amount({ color })}>
			{count} ({total})
		</dd>
	)
}
SummaryItem.Title = SummaryItemTitle
SummaryItem.Amount = SummaryItemAmount

async function getLatestTransactionDate(userId: string) {
	const latestTransaction = await prisma.transaction.findFirst({
		where: { userId },
		orderBy: { date: 'desc' },
	})
	return latestTransaction?.date ?? new Date()
}

async function getRecurringBills({
	userId,
	currentDate,
}: {
	userId: string
	currentDate: Date
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
	].sort((a, b) => (isBefore(a.date, b.date) ? 1 : -1))
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
