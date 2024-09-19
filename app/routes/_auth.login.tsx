import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, redirect, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { hashPassword, setAuthOnResponse } from '~/auth.server'
import { Button } from '~/components/Button'
import { FieldError } from '~/components/FieldError'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { TextField } from '~/components/TextField'
import { prisma } from '~/db/prisma.server'

const schema = z.object({
	email: z.string().email(),
	password: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: (intent) =>
			schema.transform(async (data, ctx) => {
				if (intent !== null) {
					// We're just validating, not loggin in yet
					return { ...data, session: null }
				}

				const loginResult = await login(data)

				if (!loginResult.success) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Invalid email or password',
					})
					return z.NEVER
				}

				return {
					...data,
					session: loginResult.data,
				}
			}),
		async: true,
	})

	if (submission.status !== 'success' || !submission.value.session) {
		return submission.reply({ hideFields: ['password'] })
	}

	return setAuthOnResponse(redirect('/'), submission.value.session)
}

export default function Login() {
	const lastResult = useActionData<typeof action>()
	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(schema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate: ({ formData }) => parseWithZod(formData, { schema }),
	})

	return (
		<div className="basis-[35rem] rounded-xl bg-white px-5 py-6 sm:px-6">
			<Form
				method="post"
				className="flex flex-col gap-8"
				aria-labelledby="sign-up"
				{...getFormProps(form)}
			>
				<h1 className="text-3xl font-bold leading-tight" id="sign-up">
					Login
				</h1>
				<div className="flex flex-col gap-4">
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
						<Input autoComplete="password" />
						<FieldError />
					</TextField>
				</div>
				<div className="flex flex-col gap-2">
					<Button type="submit" appearance="primary">
						Login
					</Button>
					<p
						id={form.errorId}
						role="alert"
						className="text-sm text-red empty:sr-only"
					>
						{form.errors}
					</p>
				</div>
				<p className="self-center text-sm text-gray-500">
					Need to create an account?{' '}
					<Link to="/sign-up" className="font-bold text-gray-900 underline">
						Sign Up
					</Link>
				</p>
			</Form>
		</div>
	)
}

async function login({ email, password }: { email: string; password: string }) {
	const user = await prisma.user.findUnique({
		where: { email },
		include: { Password: true },
	})

	if (!user || !user.Password) {
		return { success: false } as const
	}

	const hashedPassword = hashPassword({
		password,
		salt: user.Password.salt,
	})

	if (hashedPassword !== user.Password.hash) {
		return { success: false } as const
	}

	return {
		success: true,
		data: {
			userId: user.id,
			name: user.name,
		},
	} as const
}
