import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/react'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Personal finance app' },
		{ name: 'description', content: 'A dashboard app' },
	]
}

export async function loader() {
	return redirect('/overview')
}
