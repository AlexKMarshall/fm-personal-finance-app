import { forwardRef, type ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

const inputStyles = tv({
	base: 'border p-4',
})

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
	function Input({ className, ...props }, ref) {
		return <input ref={ref} className={inputStyles({ className })} {...props} />
	},
)
