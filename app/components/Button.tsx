import { forwardRef, type ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

const buttonStyles = tv({
	base: 'relative rounded-lg p-4 text-sm font-bold leading-normal',
	variants: {
		appearance: {
			primary: 'bg-gray-900 text-white hover:bg-gray-500',
			destroy:
				'bg-red text-white after:absolute after:inset-0 hover:after:bg-white/25',
			tertiary: 'p-0 font-normal text-gray-500 hover:text-gray-900',
		},
	},
})

export const Button = forwardRef<
	HTMLButtonElement,
	ComponentProps<'button'> & { appearance: 'primary' | 'tertiary' | 'destroy' }
>(function Button({ className, appearance, type = 'button', ...props }, ref) {
	return (
		<button
			ref={ref}
			className={buttonStyles({ appearance, className })}
			type={type}
			{...props}
		/>
	)
})
