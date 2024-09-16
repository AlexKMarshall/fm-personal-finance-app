import { forwardRef, type ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

const inputStyles = tv({
	base: 'rounded-lg border border-stone-500 px-5 py-3 text-sm',
})

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
	function Input({ className, ...props }, ref) {
		return <input ref={ref} className={inputStyles({ className })} {...props} />
	},
)
