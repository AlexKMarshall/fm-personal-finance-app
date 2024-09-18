import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

const isStorybook = process.argv[1]?.includes('storybook')

export default defineConfig({
	plugins: [
		!isStorybook &&
			remix({
				future: {
					v3_fetcherPersist: true,
					v3_relativeSplatPath: true,
					v3_throwAbortReason: true,
				},
			}),
		tsconfigPaths(),
		iconsSpritesheet({
			withTypes: true,
			typesOutputFile: 'app/icons/icons.ts',
			inputDir: 'app/icons',
			outputDir: 'app/assets',
			formatter: 'prettier',
		}),
	],
})
