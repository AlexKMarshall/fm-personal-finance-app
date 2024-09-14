import { Outlet } from '@remix-run/react'

export default function Auth() {
	return (
		<div>
			<div className="hidden">
				<div>Finance logo</div>
				<h2>Keep track of your money and save for your future</h2>
				<p>
					Personal finance app puts you in control of your spending. Track
					transactions, set budgets, and add to savings pots easily.
				</p>
			</div>
			<div>
				<Outlet />
			</div>
		</div>
	)
}
