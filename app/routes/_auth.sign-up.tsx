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
import { FieldDescription } from '~/components/FieldDescription'
import { FieldError } from '~/components/FieldError'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { TextField } from '~/components/TextField'
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
		<div className="rounded-xl bg-white px-5 py-6">
			<Form
				method="post"
				className="flex flex-col gap-8"
				aria-labelledby="sign-up"
				{...getFormProps(form)}
			>
				<h1 className="text-3xl leading-tight" id="sign-up">
					Sign up
				</h1>
				<div className="flex flex-col gap-4">
					<TextField
						{...getInputProps(fields.name, { type: 'text' })}
						errors={fields.name.errors}
					>
						<Label>Name</Label>
						<Input autoComplete="name" />
						<FieldError />
					</TextField>
					<TextField
						{...getInputProps(fields.email, { type: 'email' })}
						errors={fields.email.errors}
					>
						<Label>Email</Label>
						<Input autoComplete="email" inputMode="email" />
						<FieldError />
					</TextField>
					<TextField
						{...getInputProps(fields.password, { type: 'password' })}
						errors={fields.password.errors}
					>
						<Label>Create Password</Label>
						<Input autoComplete="new-password" />
						<FieldDescription>
							Passwords must be at least 8 characters
						</FieldDescription>
						<FieldError />
					</TextField>
				</div>
				<button type="submit">Create Account</button>
				<p
					id={form.errorId}
					role="alert"
					className="text-red-500 empty:sr-only"
				>
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
