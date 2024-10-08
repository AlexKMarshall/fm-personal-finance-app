import type { ComponentProps, ReactNode } from 'react'
import { tv } from 'tailwind-variants'

const cardStyles = tv({
	base: 'rounded-xl px-5 py-6 sm:p-8',
	variants: {
		theme: {
			light: 'bg-white text-gray-900',
			dark: 'bg-gray-900 text-white',
			neutral: 'text-gray-900, bg-beige-100',
		},
	},
})

export function Card({
	className,
	children,
	theme,
	...props
}: {
	className?: string
	children?: ReactNode
	theme: 'light' | 'dark' | 'neutral'
} & ComponentProps<'div'>) {
	return (
		<div className={cardStyles({ className, theme })} {...props}>
			{children}
		</div>
	)
}
