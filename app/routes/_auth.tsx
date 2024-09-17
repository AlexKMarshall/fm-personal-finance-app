import { Outlet } from '@remix-run/react'

export default function Auth() {
	return (
		<div className="flex min-h-svh flex-col lg:flex-row">
			<div className="grid place-items-center rounded-b-lg bg-gray-900 p-6 lg:hidden lg:rounded-xl lg:p-0">
				<img src="logo-large.svg" alt="finance" className="lg:hidden" />
			</div>
			<div className="hidden flex-1 p-5 [grid-template-areas:'stack'] *:[grid-area:stack] lg:grid">
				{/* <img
					src="illustration-authentication.svg"
					alt=""
					className="h-full w-auto rounded-xl bg-gray-900"
				/> */}
				<div className="flex flex-col items-start rounded-xl bg-gray-900 bg-[url('/illustration-authentication.svg')] bg-cover bg-no-repeat p-10">
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
			<div className="flex flex-1 items-center justify-center p-4 sm:p-6">
				<Outlet />
			</div>
		</div>
	)
}
