import type { Preview } from '@storybook/react'
import '../app/tailwind.css'
import { allModes } from './modes'

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		chromatic: {
			modes: {
				default: allModes.default,
			},
		},
	},
}

export default preview
