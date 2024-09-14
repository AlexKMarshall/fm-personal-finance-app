import { Form, Link } from '@remix-run/react'

export default function SignUp() {
	return (
		<div className="max-w-140">
			<h1>Sign up</h1>
			<Form method="post" className="flex flex-col gap-8">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<label htmlFor="name">Name</label>
						<input type="text" id="name" name="name" autoComplete="name" />
					</div>
					<div className="flex flex-col gap-1">
						<label htmlFor="email">Email</label>
						<input type="email" id="email" name="email" autoComplete="email" />
					</div>
					<div className="flex flex-col gap-1">
						<label htmlFor="password">Create Password</label>
						<input
							type="password"
							id="password"
							name="password"
							autoComplete="new-password"
							aria-describedby="password-description"
						/>
						<p className="self-end" id="password-description">
							Passwords must be at least 8 characters
						</p>
					</div>
				</div>
				<button>Create Account</button>
				<p className="self-center">
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</Form>
		</div>
	)
}
