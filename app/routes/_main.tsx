import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { requireAuthCookie } from '~/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const { name } = await requireAuthCookie(request)

	return { name }
}

export default function Main() {
	const { name } = useLoaderData<typeof loader>()
	return (
		<div>
			<Outlet />
			<p>{name}</p>
		</div>
	)
}
