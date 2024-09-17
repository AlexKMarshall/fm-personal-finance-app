import type { Config } from 'tailwindcss'
import TailwindFormPlugin from '@tailwindcss/forms'

export default {
	content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
	theme: {
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			beige: {
				100: '#F8F4F0',
				500: '#98908B',
			},
			gray: {
				100: '#F2F2F2',
				300: '#B3B3B3',
				500: '#696868',
				900: '#201F24',
			},
			white: '#FFFFFF',
			green: '#277C78',
			yellow: '#F2CDAC',
			cyan: '#82C9D7',
			navy: '#626070',
			red: '#C94736',
			purple: '#826CB0',
			pink: '#AF81BA',
			turquoise: '#597C7C',
			brown: '#93674F',
			magenta: '#934F6F',
			blue: '#3F82B2',
			navyGray: '#97A0AC',
			armyGreen: '#7F9161',
			gold: '#CAB361',
			orange: '#BE6C49',
		},
		extend: {
			fontFamily: {
				sans: [
					'"Inter"',
					'ui-sans-serif',
					'system-ui',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
			},
		},
	},
	plugins: [TailwindFormPlugin],
} satisfies Config
