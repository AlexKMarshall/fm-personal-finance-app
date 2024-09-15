import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireAuthCookie } from '~/auth'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Personal finance app' },
		{ name: 'description', content: 'A dashboard app' },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { name } = await requireAuthCookie(request)

	return { name }
}

export default function Index() {
	const { name } = useLoaderData<typeof loader>()
	return (
		<div>
			<h1>Overview</h1>
			<p>{name}</p>
		</div>
	)
}
