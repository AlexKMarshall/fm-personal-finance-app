import {
	forwardRef,
	type ComponentProps,
	createContext,
	useContext,
} from 'react'
import { tv } from 'tailwind-variants'

const inputStyles = tv({
	base: 'rounded-lg border border-beige-500 px-5 py-3 text-sm text-gray-900 aria-[invalid]:border-red aria-[invalid]:text-red',
})

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
	function Input(props, ref) {
		const inputContext = useContext(InputContext)
		const { className, ...mergedProps } = { ...inputContext, ...props }

		return (
			<input
				ref={ref}
				className={inputStyles({ className })}
				{...mergedProps}
			/>
		)
	},
)

export const InputContext = createContext<ComponentProps<typeof Input>>({})
