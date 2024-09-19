import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

const cardStyles = tv({
	base: 'rounded-xl bg-white px-5 py-6 sm:p-8',
})

export function Card({
	className,
	children,
}: {
	className?: string
	children?: ReactNode
}) {
	return <div className={cardStyles({ className })}>{children}</div>
}
