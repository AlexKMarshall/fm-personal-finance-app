import { forwardRef, type ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

const fieldDescriptionStyles = tv({
	base: 'self-end text-xs leading-normal text-gray-500',
})

export const FieldDescription = forwardRef<
	HTMLParagraphElement,
	ComponentProps<'p'>
>(function FieldDescription({ className, ...props }, ref) {
	return (
		<p ref={ref} className={fieldDescriptionStyles({ className })} {...props} />
	)
})
