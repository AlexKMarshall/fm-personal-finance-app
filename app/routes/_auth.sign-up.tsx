import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, redirect, useActionData } from '@remix-run/react'
import { z } from 'zod'

const schema = z.object({
	name: z.string(),
	email: z.string().email(),
	password: z.string().min(8),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = parseWithZod(formData, { schema })

	if (submission.status !== 'success') {
		return submission.reply()
	}

	// TODO: Sign up the user

	return redirect('/')
}

export default function SignUp() {
	const lastResult = useActionData<typeof action>()
	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(schema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate: ({ formData }) => parseWithZod(formData, { schema }),
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
						<label htmlFor={fields.name.id}>Name</label>
						<input
							{...getInputProps(fields.name, { type: 'text' })}
							autoComplete="name"
						/>
						<p id={fields.name.errorId} role="alert" className="text-red-500">
							{fields.name.errors}
						</p>
					</div>
					<div className="flex flex-col gap-1">
						<label htmlFor={fields.email.id}>Email</label>
						<input
							{...getInputProps(fields.email, { type: 'email' })}
							autoComplete="email"
						/>
						<p id={fields.email.errorId} role="alert" className="text-red-500">
							{fields.email.errors}
						</p>
					</div>
					<div className="flex flex-col gap-1">
						<label htmlFor={fields.password.id}>Create Password</label>
						<input
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
