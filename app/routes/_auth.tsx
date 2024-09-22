import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, redirect } from '@remix-run/react'
import { getAuthFromRequest } from '~/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
	// Redirect the user home if they are already authenticated
	const auth = await getAuthFromRequest(request)
	if (auth) {
		return redirect('/')
	}

	return null
}

export default function Auth() {
	return (
		<div className="flex min-h-svh flex-col lg:grid lg:grid-cols-[auto_1fr]">
			<div className="grid place-items-center rounded-b-lg bg-gray-900 p-6 lg:hidden lg:rounded-xl lg:p-0">
				<img src="logo-large.svg" alt="finance" className="lg:hidden" />
			</div>
			<div className="hidden max-h-svh p-5 lg:grid">
				<div className="grid aspect-[91/150] h-full overflow-hidden rounded-xl bg-gray-900 [grid-template-areas:'stack'] *:[grid-area:stack]">
					<img
						src="illustration-authentication.svg"
						alt=""
						className="h-full scale-[1.01]"
					/>
					<div className="relative flex h-full flex-col items-start p-10">
						<img src="logo-large.svg" alt="finance" />
						<h2 className="mb-6 mt-auto text-3xl font-bold leading-tight text-white">
							Keep track of your money and save for your future
						</h2>
						<p className="text-sm leading-normal text-white">
							Personal finance app puts you in control of your spending. Track
							transactions, set budgets, and add to savings pots easily.
						</p>
					</div>
				</div>
			</div>
			<div className="flex flex-1 items-center justify-center p-4 sm:p-6">
				<Outlet />
			</div>
		</div>
	)
}
