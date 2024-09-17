import {
	forwardRef,
	type ComponentProps,
	createContext,
	useContext,
} from 'react'
import { tv } from 'tailwind-variants'

const fieldErrorStyles = tv({
	base: 'sr-only self-end text-xs leading-normal text-red group-has-[[aria-invalid]]:not-sr-only',
})

export const FieldError = forwardRef<
	HTMLParagraphElement,
	Omit<ComponentProps<'p'>, 'children'>
>(function FieldError({ role = 'alert', ...props }, ref) {
	const fieldDescriptionContext = useFieldErrorContext()
	const {
		className,
		isInvalid,
		errors = [],
		...mergedProps
	} = {
		...fieldDescriptionContext,
		...props,
		role,
	}
	return (
		<div
			ref={ref}
			className={fieldErrorStyles({ className })}
			{...mergedProps}
			data-invalid={isInvalid ?? undefined}
		>
			<p className="hidden group-has-[[aria-invalid]]:block">
				{isInvalid ? errors?.join(',') : null}
			</p>
		</div>
	)
})

export const FieldErrorContext = createContext<
	| (ComponentProps<typeof FieldError> & {
			id: string
			isInvalid: boolean
			errors?: string[]
	  })
	| null
>(null)
function useFieldErrorContext() {
	const context = useContext(FieldErrorContext)
	if (!context) {
		throw new Error(
			'FieldError components must be rendered inside a FieldErrorContext',
		)
	}
	return context
}
