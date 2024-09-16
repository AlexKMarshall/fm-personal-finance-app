import { forwardRef, type ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

const labelStyles = tv({
	base: 'block text-xs font-bold leading-normal text-gray-500',
})

export const Label = forwardRef<HTMLLabelElement, ComponentProps<'label'>>(
	function Label({ className, ...props }, ref) {
		return <label ref={ref} className={labelStyles({ className })} {...props} />
	},
)
