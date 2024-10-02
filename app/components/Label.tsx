import {
	createContext,
	forwardRef,
	useContext,
	type ComponentProps,
} from 'react'
import { tv } from 'tailwind-variants'
import { Label as RACLabel } from 'react-aria-components'

const labelStyles = tv({
	base: 'block text-xs font-bold leading-normal text-gray-500 group-has-[[aria-invalid]]:text-red group-has-[[data-invalid]]:text-red',
})

export const Label = forwardRef<HTMLLabelElement, ComponentProps<'label'>>(
	function Label(props, ref) {
		const labelContext = useContext(LabelContext)
		const { className, ...mergedProps } = { ...labelContext, ...props }

		return (
			<RACLabel
				ref={ref}
				className={labelStyles({ className })}
				{...mergedProps}
			/>
		)
	},
)

export const LabelContext = createContext<ComponentProps<typeof Label>>({})
