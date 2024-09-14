import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Personal finance app' },
		{ name: 'description', content: 'A dashboard app' },
	]
}

export default function Index() {
	return (
		<div>
			<h1>Hello world</h1>
		</div>
	)
}
