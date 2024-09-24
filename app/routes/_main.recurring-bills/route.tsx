import {
	Select,
	Button as RACButton,
	SelectValue,
	Popover,
	ListBox,
	ListBoxItem,
} from 'react-aria-components'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'
import { Card } from '~/components/Card'
import { prisma } from '~/db/prisma.server'
import { formatCurrency, formatDayOfMonth } from '~/utils/format'
import { RecurringBills } from './RecurringBills'
import { addDays, addMonths, isBefore, startOfMonth, subMonths } from 'date-fns'
import { Icon } from '~/components/Icon'
import { tv } from 'tailwind-variants'
import { useContext, createContext, type ReactNode, useRef } from 'react'
import { z } from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { paginate } from '~/utils/pagination'
import { Pagination } from '~/components/Pagination'
import { Label } from '~/components/Label'
import { matchSorter } from 'match-sorter'
import { Input } from '~/components/Input'

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
	page: z.coerce.number().default(1),
	size: z.coerce.number().default(10),
	sort: z.enum(sortKeys).optional().default('date:desc'),
	search: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const searchParams = new URL(request.url).searchParams

	const submission = parseWithZod(searchParams, { schema: filterSchema })
	if (submission.status !== 'success') {
		throw new Error('Invalid search params')
	}

	const { page, size, sort, search } = submission.value

	const currentDate = await getLatestTransactionDate(userId)

	const recurringBills = await getRecurringBills({
		userId,
		currentDate,
		sort,
		search,
	})

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

	// We search here rather than when getting the bills as search shouldn't impact the totals
	const searchedBills = search
		? matchSorter(formattedRecurringBills, search, {
				keys: ['name'],
				baseSort: (a, b) => (a.index < b.index ? -1 : 1),
			})
		: formattedRecurringBills

	return json({
		recurringBills: paginate(searchedBills, { page, size }),
		totalBills,
		paidBills,
		upcomingBills,
		soonBills,
		selectedSort: sort,
		search,
	})
}

export default function Overview() {
	const {
		recurringBills,
		totalBills,
		paidBills,
		upcomingBills,
		soonBills,
		selectedSort,
		search,
	} = useLoaderData<typeof loader>()
	const formRef = useRef<HTMLFormElement>(null)
	const submit = useSubmit()
	return (
		<div className="flex flex-col gap-6 @container">
			<h1 className="text-3xl font-bold leading-tight">Recurring Bills</h1>
			<div className="flex flex-col gap-6 @5xl:flex-row @5xl:items-start">
				<div className="flex flex-col gap-3 @[40rem]:flex-row @[40rem]:gap-6 @5xl:flex-col">
					<Card
						theme="dark"
						className="flex flex-1 items-center gap-5 @[40rem]:flex-col @[40rem]:items-start @[40rem]:justify-between @[40rem]:gap-8"
					>
						<Icon name="RecurringBillsOutline" className="size-10" />
						<div className="flex flex-col gap-3" data-testid="total-bills">
							<h2 id="total-bills" className="text-sm leading-normal">
								Total Bills
							</h2>
							<p className="text-3xl font-bold leading-tight">{totalBills}</p>
						</div>
					</Card>
					<Card theme="light" className="flex-1">
						<h2 className="mb-5 font-bold">Summary</h2>
						<dl>
							<SummaryItem className="border-b border-gray-100 py-4 first:pt-0 last:border-b-0 last:pb-0">
								<SummaryItem.Title>Total Paid</SummaryItem.Title>
								<SummaryItem.Amount
									count={paidBills.count}
									total={paidBills.total}
								/>
							</SummaryItem>
							<SummaryItem className="border-b border-gray-100 py-4 first:pt-0 last:border-b-0 last:pb-0">
								<SummaryItem.Title>Total Upcoming</SummaryItem.Title>
								<SummaryItem.Amount
									count={upcomingBills.count}
									total={upcomingBills.total}
								/>
							</SummaryItem>
							<SummaryItem
								color="red"
								className="border-b border-gray-100 py-4 first:pt-0 last:border-b-0 last:pb-0"
							>
								<SummaryItem.Title>Due Soon</SummaryItem.Title>
								<SummaryItem.Amount
									count={soonBills.count}
									total={soonBills.total}
								/>
							</SummaryItem>
						</dl>
					</Card>
				</div>
				<Card theme="light">
					<Form
						ref={formRef}
						replace
						className="mb-6 flex justify-end gap-6 @container"
					>
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
					</Form>
					<RecurringBills recurringBills={recurringBills.items} />
					<Pagination total={recurringBills.count} />
				</Card>
			</div>
		</div>
	)
}

const summaryItemStyles = tv({
	slots: {
		base: 'flex justify-between gap-16',
		title: 'whitespace-nowrap text-xs',
		amount: 'whitespace-nowrap text-xs font-bold',
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
