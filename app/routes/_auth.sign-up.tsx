import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import {
	conformZodMessage,
	getZodConstraint,
	parseWithZod,
} from '@conform-to/zod'
import type { ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, redirect, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { generateSalt, hashPassword, setAuthOnResponse } from '~/auth.server'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { prisma } from '~/db/prisma.server'

function createSchema(options?: {
	isEmailUnique: (email: string) => Promise<boolean>
}) {
	return z.object({
		name: z.string(),
		email: z
			.string()
			.email()
			.pipe(
				z.string().superRefine((email, ctx) => {
					if (typeof options?.isEmailUnique !== 'function') {
						return ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: conformZodMessage.VALIDATION_UNDEFINED,
							fatal: true,
						})
					}

					return options.isEmailUnique(email).then((isUnique) => {
						if (!isUnique) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: 'Email is already in use',
							})
						}
					})
				}),
			),
		password: z.string().min(8),
	})
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: createSchema({ isEmailUnique }),
		async: true,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const user = await createUser(submission.value)
	return setAuthOnResponse(redirect('/'), {
		userId: user.id,
		name: user.name,
	})
}

export default function SignUp() {
	const lastResult = useActionData<typeof action>()
	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(createSchema()),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate: ({ formData }) =>
			parseWithZod(formData, { schema: createSchema() }),
	})

	return (
		<div className="max-w-lg">
			<h1>Sign up</h1>
			<Form
				method="post"
				className="flex flex-col gap-8"
				{...getFormProps(form)}
			>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<Label htmlFor={fields.name.id}>Name</Label>
						<Input
							{...getInputProps(fields.name, { type: 'text' })}
							autoComplete="name"
						/>
						<p id={fields.name.errorId} role="alert" className="text-red-500">
							{fields.name.errors}
						</p>
					</div>
					<div className="flex flex-col gap-1">
						<Label htmlFor={fields.email.id}>Email</Label>
						<Input
							{...getInputProps(fields.email, { type: 'email' })}
							autoComplete="email"
						/>
						<p id={fields.email.errorId} role="alert" className="text-red-500">
							{fields.email.errors}
						</p>
					</div>
					<div className="flex flex-col gap-1">
						<Label htmlFor={fields.password.id}>Create Password</Label>
						<Input
							{...getInputProps(fields.password, { type: 'password' })}
							autoComplete="new-password"
						/>
						{fields.password.errors ? null : (
							<p className="self-end" id={fields.password.descriptionId}>
								Passwords must be at least 8 characters
							</p>
						)}
						<p
							id={fields.password.errorId}
							role="alert"
							className="text-red-500"
						>
							{fields.password.errors}
						</p>
					</div>
				</div>
				<button type="submit">Create Account</button>
				<p id={form.errorId} role="alert" className="text-red-500">
					{form.errors}
				</p>
				<p className="self-center">
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</Form>
		</div>
	)
}

function createUser({
	name,
	email,
	password,
}: {
	name: string
	email: string
	password: string
}) {
	const salt = generateSalt()
	const hash = hashPassword({ password, salt })

	return prisma.user.create({
		data: {
			name,
			email,
			Password: { create: { salt, hash } },
		},
		select: { id: true, name: true },
	})
}

async function isEmailUnique(email: string) {
	const user = await prisma.user.findUnique({ where: { email } })
	return user === null
}
