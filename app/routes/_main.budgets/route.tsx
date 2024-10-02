import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { isSameMonth } from 'date-fns'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { requireAuthCookie } from '~/auth.server'
import { Button } from '~/components/Button'
import { Card } from '~/components/Card'
import { Donut } from '~/components/Donut'
import { prisma } from '~/db/prisma.server'
import { formatCurrency, formatDate } from '~/utils/format'
import { getLatestTransactionDate } from '../_main.recurring-bills/recurring-bills.queries'
import { Budget, ColorIndicator } from './Budget'
import { DialogTrigger, Dialog, Modal } from '~/components/Dialog'
import {
	getFormProps,
	getInputProps,
	getSelectProps,
	useForm,
} from '@conform-to/react'
import { TextField } from '~/components/TextField'
import { Label } from '~/components/Label'
import { Input } from '~/components/Input'
import { FieldError } from '~/components/FieldError'

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

	const categories = await getCategories()
	const colors = (await getColors(userId)).map(({ name, id, Budgets }) => ({
		name,
		id,
		isUsed: Budgets.length > 0,
	}))

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
		categories,
		colors,
	})
}

const createBudgetSchema = z.object({
	intent: z.literal('create'),
	categoryId: z.string(),
	amountInDollars: z.coerce.number().positive(),
	colorId: z.string(),
})
const deleteBudgetSchema = z.object({
	intent: z.literal('delete'),
	budgetId: z.string(),
})

const actionSchema = z.union([createBudgetSchema, deleteBudgetSchema])

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
		case 'create':
			await createBudget({
				amountInDollars: data.amountInDollars,
				userId,
				categoryId: data.categoryId,
				colorId: data.colorId,
			})
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
	const { budgets, totalSpent, totalBudget, categories, colors } =
		useLoaderData<typeof loader>()
	const [modalState, setModalState] = useState<ModalState>(null)
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()
	const [form, fields] = useForm({
		constraint: getZodConstraint(createBudgetSchema),
		onValidate: ({ formData }) =>
			parseWithZod(formData, { schema: createBudgetSchema }),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
	})
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

	useEffect(() => {
		// close the modal on successful action
		if (navigation.state === 'idle' && actionData?.status === 'success') {
			setModalState(null)
			setIsCreateModalOpen(false)
		}
	}, [actionData?.status, navigation.state])

	return (
		<>
			<div className="flex items-center justify-between gap-8">
				<h1 className="text-3xl font-bold leading-tight">Budgets</h1>
				<DialogTrigger
					isOpen={isCreateModalOpen}
					onOpenChange={setIsCreateModalOpen}
				>
					<Button appearance="primary">
						<span aria-hidden>+&nbsp;</span>
						Add Budget
					</Button>
					<Modal isDismissable>
						<Dialog title="Add New Budget">
							<Form
								className="flex flex-col gap-5"
								{...getFormProps(form)}
								method="post"
							>
								<p className="text-sm leading-normal text-gray-500">
									Choose a category to set a spending budget. These categories
									can help you monitor spending.
								</p>
								<div className="group flex flex-col gap-1">
									<Label htmlFor={fields.categoryId.id}>Budget Category</Label>
									<select {...getSelectProps(fields.categoryId)}>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
								</div>
								<TextField
									{...getInputProps(fields.amountInDollars, { type: 'text' })}
									errors={fields.amountInDollars.errors}
								>
									<Label>Maximum Spend</Label>
									<Input />
									<FieldError />
								</TextField>
								<div className="group flex flex-col gap-1">
									<Label htmlFor={fields.colorId.id}>Theme</Label>
									<select {...getSelectProps(fields.colorId)}>
										{colors.map((color) => (
											<option key={color.id} value={color.id}>
												{color.name}
											</option>
										))}
									</select>
								</div>
								<Button
									type="submit"
									appearance="primary"
									name={fields.intent.name}
									value="create"
								>
									Add Budget
								</Button>
							</Form>
						</Dialog>
					</Modal>
				</DialogTrigger>
			</div>
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
				<Modal isDismissable>
					<Dialog
						className="flex max-w-xl flex-col gap-6 rounded-xl bg-white px-5 py-6"
						title={`Delete ‘${modalState?.actionItem.category}’?`}
					>
						{({ close }) =>
							modalState !== null ? (
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
							) : null
						}
					</Dialog>
				</Modal>
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

function getCategories() {
	return prisma.category.findMany({
		select: {
			name: true,
			id: true,
		},
		orderBy: {
			name: 'asc',
		},
	})
}

function getColors(userId: string) {
	return prisma.color.findMany({
		select: {
			name: true,
			id: true,
			Budgets: {
				where: {
					userId,
				},
				select: {
					id: true,
				},
			},
		},
		orderBy: {
			name: 'asc',
		},
	})
}

function createBudget({
	amountInDollars,
	userId,
	categoryId,
	colorId,
}: {
	amountInDollars: number
	userId: string
	categoryId: string
	colorId: string
}) {
	const amountInCents = amountInDollars * 100
	return prisma.budget.create({
		data: {
			amount: amountInCents,
			userId,
			categoryId,
			colorId,
		},
	})
}
