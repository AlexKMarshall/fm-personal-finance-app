import {
	createContext,
	forwardRef,
	useContext,
	type ComponentProps,
} from 'react'
import { tv } from 'tailwind-variants'

const fieldDescriptionStyles = tv({
	base: 'self-end text-xs leading-normal text-gray-500',
})

export const FieldDescription = forwardRef<
	HTMLParagraphElement,
	ComponentProps<'p'>
>(function FieldDescription(props, ref) {
	const fieldDescriptionContext = useContext(FieldDescriptionContext)
	const { className, ...mergedProps } = { ...fieldDescriptionContext, ...props }
	return (
		<p
			ref={ref}
			className={fieldDescriptionStyles({ className })}
			{...mergedProps}
		/>
	)
})

export const FieldDescriptionContext = createContext<
	ComponentProps<typeof FieldDescription>
>({})
