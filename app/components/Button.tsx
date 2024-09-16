import { forwardRef, type ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

const buttonStyles = tv({
	base: 'rounded-lg p-4 text-sm font-bold leading-normal',
	variants: {
		appearance: {
			primary: 'bg-black text-white hover:bg-gray-500',
		},
	},
})

export const Button = forwardRef<
	HTMLButtonElement,
	ComponentProps<'button'> & { appearance: 'primary' }
>(function Button({ className, appearance, ...props }, ref) {
	return (
		<button
			ref={ref}
			className={buttonStyles({ appearance, className })}
			{...props}
		/>
	)
})
