import { forwardRef } from 'react'
import type { ComponentProps, Ref } from 'react'
import { tv } from 'tailwind-variants'

const sidebarStyles = tv({
	base: 'rounded-t-lg bg-gray-900 px-4 pt-2 sm:px-10',
})

export const Sidebar = forwardRef(function Sidebar(
	{ className, ...props }: ComponentProps<'aside'>,
	ref: Ref<HTMLElement>,
) {
	return <aside ref={ref} className={sidebarStyles({ className })} {...props} />
})
