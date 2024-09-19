import clsx from 'clsx'
import { forwardRef } from 'react'
import type { ComponentProps, Ref } from 'react'
import { tv } from 'tailwind-variants'

const sidebarStyles = tv({
	base: clsx(
		'overflow-hidden rounded-tl-lg rounded-tr-lg bg-gray-900 px-4 pt-2',
		'sm:px-10',
		'lg:flex lg:w-80 lg:flex-col lg:gap-20 lg:rounded-br-2xl lg:rounded-tl-none lg:rounded-tr-2xl lg:px-0 lg:py-10 lg:pr-6',
	),
})

export const Sidebar = forwardRef(function Sidebar(
	{ className, children, ...props }: ComponentProps<'aside'>,
	ref: Ref<HTMLElement>,
) {
	return (
		<aside ref={ref} className={sidebarStyles({ className })} {...props}>
			<img
				src="logo-large.svg"
				alt="finance"
				className="ml-8 hidden self-start lg:block"
			/>
			{children}
		</aside>
	)
})
