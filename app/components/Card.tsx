import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

const cardStyles = tv({
	base: 'rounded-xl px-5 py-6 sm:p-8',
	variants: {
		theme: {
			light: 'bg-white text-gray-900',
			dark: 'bg-gray-900 text-white',
		},
	},
})

export function Card({
	className,
	children,
	theme,
}: {
	className?: string
	children?: ReactNode
	theme: 'light' | 'dark'
}) {
	return <div className={cardStyles({ className, theme })}>{children}</div>
}
