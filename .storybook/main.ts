import type { StorybookConfig } from '@storybook/react-vite'

import { join, dirname } from 'path'

function getAbsolutePath(value: string): any {
	return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
	stories: ['../app/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		getAbsolutePath('@storybook/addon-links'),
		getAbsolutePath('@storybook/addon-essentials'),
		getAbsolutePath('@chromatic-com/storybook'),
		getAbsolutePath('@storybook/addon-interactions'),
	],
	framework: {
		name: getAbsolutePath('@storybook/react-vite'),
		options: {},
	},
	typescript: {
		reactDocgen: 'react-docgen-typescript',
	},
}
export default config
