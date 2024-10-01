import { parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { isSameMonth } from 'date-fns'
import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { z } from 'zod'
import { requireAuthCookie } from '~/auth.server'
import { Button } from '~/components/Button'
import { Card } from '~/components/Card'
import { Donut } from '~/components/Donut'
import { Icon } from '~/components/Icon'
import { prisma } from '~/db/prisma.server'
import { formatCurrency, formatDate } from '~/utils/format'
import { getLatestTransactionDate } from '../_main.recurring-bills/recurring-bills.queries'
import { Budget, ColorIndicator } from './Budget'

export async function loader({ request }: LoaderFunctionArgs) {
	const { userId } = await requireAuthCookie(request)
	const currentDate = await getLatestTransactionDate(userId)

	const budgets = await getBudgets({ userId, currentDate })

	const formattedBudgets = budgets.map((budget) => {
		const spentPercent = Math.min(budget.spent / budget.amount, 1) * 100
		return {
			id: budget.id,
			amount: formatCurrency(budget.amount),
			amountNumber: budget.amount,
			category: budget.Category.name,
			color: budget.Color.name,
			spentNumber: budget.spent,
			spent: formatCurrency(budget.spent),
			spentPercent,
			free: formatCurrency(budget.free),
			recentTransactions: budget.Category.Transactions.slice(0, 3).map(
				(transaction) => ({
					id: transaction.id,
					amount: formatCurrency(transaction.amount),
					date: formatDate(transaction.date),
					name: transaction.Counterparty.name,
					avatar: transaction.Counterparty.avatarUrl,
				}),
			),
		}
	})

	return json({
		budgets: formattedBudgets,
		totalSpent: formatCurrency(
			formattedBudgets.reduce((total, budget) => total + budget.spentNumber, 0),
			{ decimals: 0 },
		),
		totalBudget: formatCurrency(
			formattedBudgets.reduce(
				(total, budget) => total + budget.amountNumber,
				0,
			),
			{ decimals: 0 },
		),
	})
}

const actionSchema = z.object({
	intent: z.literal('delete'),
	budgetId: z.string().min(1),
})

export async function action({ request }: ActionFunctionArgs) {
	const { userId } = await requireAuthCookie(request)

	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: actionSchema })
	if (submission.status !== 'success') {
		throw new Error('Invalid form submission')
	}

	const data = submission.value

	switch (data.intent) {
		case 'delete':
			await deleteBudget({ budgetId: data.budgetId, userId })
			return json({ status: 'success' })
	}
}

function deleteBudget({
	budgetId,
	userId,
}: {
	budgetId: string
	userId: string
}) {
	return prisma.budget.delete({
		where: {
			id: budgetId,
			userId,
		},
	})
}

type ModalState = {
	action: 'delete'
	actionItem: {
		category: string
		budgetId: string
	}
} | null

export default function BudgetsRoute() {
	const { budgets, totalSpent, totalBudget } = useLoaderData<typeof loader>()
	const [modalState, setModalState] = useState<ModalState>(null)
	const actionData = useActionData<typeof action>()

	useEffect(() => {
		// close the modal on successful action
		if (actionData?.status === 'success') {
			setModalState(null)
		}
	}, [actionData?.status])

	return (
		<>
			<h1 className="text-3xl font-bold leading-tight">Budgets</h1>
			<div className="relative flex flex-col gap-6 @5xl:flex-row @5xl:items-start">
				<Card
					theme="light"
					className="top-4 flex flex-col gap-8 @xl:flex-row @5xl:sticky @5xl:flex-col"
					aria-labelledby="spending-summary"
					role="group"
				>
					<div className="grid place-items-center p-5 [grid-template-areas:'stack'] *:[grid-area:stack]">
						<Donut
							values={budgets.map(
								({ id, color, amountNumber, spentPercent }) => ({
									id,
									color,
									value: amountNumber,
									utilization: spentPercent / 100,
								}),
							)}
						/>
						<div className="grid place-items-center p-10 sm:p-20">
							<p className="flex flex-col items-center text-center">
								<span className="text-3xl font-bold leading-tight">
									{totalSpent}
								</span>
								<span className="text-xs leading-normal text-gray-500">
									of {totalBudget} limit
								</span>
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-6">
						<h2
							id="spending-summary"
							className="mb-6 text-xl font-bold leading-tight"
						>
							Spending Summary
						</h2>
						<dl>
							{budgets.map((budget) => (
								<div
									key={budget.id}
									className="flex items-center gap-4 border-b border-gray-500/15 pb-4 pt-4 first:pt-0 last:border-b-0 last:pb-0"
								>
									<ColorIndicator
										color={budget.color}
										shape="bar"
										className="self-stretch"
									/>
									<dt className="flex-1 text-sm leading-normal text-gray-500">
										{budget.category}
									</dt>
									<dd className="flex items-center gap-2 text-xs leading-normal text-gray-500">
										<span className="text-default font-bold text-gray-900">
											{budget.spent}
										</span>
										of {budget.amount}
									</dd>
								</div>
							))}
						</dl>
					</div>
				</Card>
				<div className="flex flex-1 flex-col gap-6">
					{budgets.map((budget) => (
						<Budget
							{...budget}
							key={budget.id}
							onDelete={() =>
								setModalState({
									action: 'delete',
									actionItem: {
										category: budget.category,
										budgetId: budget.id,
									},
								})
							}
						/>
					))}
				</div>
			</div>
			<DialogTrigger
				isOpen={modalState !== null}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						setModalState(null)
					}
				}}
			>
				<ModalOverlay className="fixed inset-0 grid place-items-center bg-black/50 p-5">
					<Modal isDismissable>
						<Dialog className="flex max-w-xl flex-col gap-6 rounded-xl bg-white px-5 py-6">
							{({ close }) =>
								modalState !== null ? (
									<>
										<div className="flex justify-between gap-6">
											<Heading
												slot="title"
												className="text-xl font-bold leading-tight"
											>
												Delete &lsquo;{modalState.actionItem.category}&rsquo;?
											</Heading>
											<Button
												appearance="tertiary"
												aria-label="Cancel"
												onPress={close}
											>
												<Icon name="XCircle" className="size-6" />
											</Button>
										</div>
										<div className="flex flex-col gap-5">
											<p className="text-sm text-gray-500">
												Are you sure you want to delete this budget? This action
												cannot be reversed, and all the data inside it will be
												removed forever.
											</p>
											<Form method="post" replace>
												<input
													type="hidden"
													name="budgetId"
													value={modalState.actionItem.budgetId}
												/>
												<Button
													appearance="destroy"
													type="submit"
													className="w-full"
													name="intent"
													value="delete"
												>
													Yes, Confirm Deletion
												</Button>
											</Form>
											<Button appearance="tertiary" onPress={close}>
												No, Go Back
											</Button>
										</div>
									</>
								) : null
							}
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>
		</>
	)
}

async function getBudgets({
	userId,
	currentDate,
}: {
	userId: string
	currentDate: Date
}) {
	const budgets = await prisma.budget.findMany({
		where: {
			userId,
		},
		select: {
			id: true,
			amount: true,
			Category: {
				select: {
					name: true,
					Transactions: {
						where: {
							userId,
						},
						select: {
							id: true,
							Counterparty: {
								select: { name: true, avatarUrl: true },
							},
							amount: true,
							date: true,
						},
						orderBy: {
							date: 'desc',
						},
					},
				},
			},
			Color: {
				select: {
					name: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return budgets.map((budget) => {
		const currentMonthTransactions = budget.Category.Transactions.filter(
			(transaction) => isSameMonth(transaction.date, currentDate),
		)
		const spent = Math.abs(
			currentMonthTransactions.reduce(
				(total, transaction) => total + transaction.amount,
				0,
			),
		)
		const free = Math.max(budget.amount - spent, 0)
		return { ...budget, spent, free }
	})
}
