import type { ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

import { forwardRef, useId } from 'react'
import { InputContext } from './Input'
import { LabelContext } from './Label'
import { FieldDescriptionContext } from './FieldDescription'
import { FieldErrorContext } from './FieldError'

const textFieldStyles = tv({
	base: 'group flex flex-col gap-1',
})

export const TextField = forwardRef<
	HTMLDivElement,
	Pick<ComponentProps<'div'>, 'children' | 'className'> & {
		id?: string
		descriptionId?: string
		type?: 'text' | 'email' | 'password'
		name?: string
		form?: string
		required?: boolean
		minLength?: number
		'aria-invalid'?: boolean
		'aria-describedby'?: string
		errors?: string[]
	}
>(function TextField(
	{
		className,
		children,
		id: consumerId,
		descriptionId: consumerDescriptionId,
		type = 'text',
		name,
		form,
		required,
		minLength,
		'aria-invalid': ariaInvalid,
		errors,
		...props
	},
	ref,
) {
	const defaultBaseId = useId()
	const id = consumerId ?? defaultBaseId
	const descriptionId = consumerDescriptionId ?? `${id}-description`
	const errorMessageId = `${id}-error`
	const ariaDescribedBy = ariaInvalid ? errorMessageId : descriptionId

	return (
		<div
			ref={ref}
			className={textFieldStyles({ className })}
			{...props}
			data-invalid={ariaInvalid || undefined}
		>
			<InputContext.Provider
				value={{
					id,
					'aria-describedby': ariaDescribedBy,
					type,
					name,
					form,
					required: required || undefined,
					minLength,
					'aria-invalid': ariaInvalid || undefined,
				}}
			>
				<LabelContext.Provider value={{ htmlFor: id }}>
					<FieldDescriptionContext.Provider value={{ id: descriptionId }}>
						<FieldErrorContext.Provider
							value={{
								id: errorMessageId,
								isInvalid: ariaInvalid ?? false,
								errors,
							}}
						>
							{children}
						</FieldErrorContext.Provider>
					</FieldDescriptionContext.Provider>
				</LabelContext.Provider>
			</InputContext.Provider>
		</div>
	)
})
