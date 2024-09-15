import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { requireAuthCookie } from '~/auth'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Personal finance app' },
		{ name: 'description', content: 'A dashboard app' },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAuthCookie(request)

	return null
}

export default function Index() {
	return (
		<div>
			<h1>Overview</h1>
		</div>
	)
}
