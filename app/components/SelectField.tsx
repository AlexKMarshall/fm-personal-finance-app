import { useInputControl } from '@conform-to/react'
import { useId, type ComponentProps, createContext, useContext } from 'react'
import {
	Select as RACSelect,
	Button as RACButton,
	Popover,
	ListBox,
	ListBoxItem,
	SelectValue as RACSelectValue,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Icon } from './Icon'
import { FieldErrorContext } from './FieldError'

const selectStyles = tv({
	base: 'group flex flex-col gap-1',
})

export function SelectField({
	className,
	control,
	errors,
	id: consumerId,
	'aria-invalid': ariaInvalid,
	...props
}: ComponentProps<typeof RACSelect> & {
	control: ReturnType<typeof useInputControl<string>>
	errors?: string[]
	'aria-invalid'?: boolean
}) {
	const defaultBaseId = useId()
	const id = consumerId ?? defaultBaseId
	const errorMessageId = `${id}-error`

	return (
		<FieldErrorContext.Provider
			value={{
				id: errorMessageId,
				isInvalid: ariaInvalid ?? props.isInvalid ?? false,
				errors,
			}}
		>
			<SelectTriggerContext.Provider
				value={{
					'aria-describedby': errorMessageId,
					isInvalid: ariaInvalid ?? props.isInvalid ?? false,
				}}
			>
				<RACSelect
					{...props}
					id={id}
					isInvalid={ariaInvalid ?? props.isInvalid}
					selectedKey={control.value}
					onSelectionChange={(categoryId) => {
						if (typeof categoryId !== 'string') {
							throw new Error('Invalid colorId')
						}
						control.change(categoryId)
					}}
					onFocus={() => control.focus()}
					onBlur={() => control.blur()}
					onFocusChange={(isFocused) => {
						if (isFocused) {
							return control.focus()
						}
						return control.blur()
					}}
					className={(classNameProps) =>
						selectStyles({
							className:
								typeof className === 'function'
									? className(classNameProps)
									: className,
						})
					}
				/>
			</SelectTriggerContext.Provider>
		</FieldErrorContext.Provider>
	)
}

const SelectTriggerContext = createContext<{
	'aria-describedby': string
	isInvalid: boolean
} | null>(null)

function useSelectTriggerContext() {
	const context = useContext(SelectTriggerContext)
	if (!context) {
		throw new Error(
			'SelectTrigger components must be rendered inside a SelectTriggerContext',
		)
	}
	return context
}

const selectTriggerStyles = tv({
	base: 'flex items-center justify-between gap-4 rounded-lg border border-beige-500 px-5 py-3 text-left text-sm text-gray-900 group-has-[[data-invalid]]:border-red',
})
export function SelectTrigger({
	className,
	children,
	...props
}: Omit<ComponentProps<typeof RACButton>, 'type'>) {
	const { 'aria-describedby': ariaDescribedBy, isInvalid } =
		useSelectTriggerContext()
	return (
		<RACButton
			{...props}
			type="button"
			aria-describedby={ariaDescribedBy}
			data-invalid={isInvalid || undefined}
			className={(classNameProps) =>
				selectTriggerStyles({
					className:
						typeof className === 'function'
							? className(classNameProps)
							: className,
				})
			}
		>
			{(renderProps) => (
				<>
					{typeof children === 'function' ? children(renderProps) : children}
					<Icon
						name="CaretDown"
						className="size-4 group-data-[open]:rotate-180"
					/>
				</>
			)}
		</RACButton>
	)
}

const selectOptionsStyles = tv({
	base: 'max-h-80 w-full overflow-y-auto rounded-lg bg-white px-5 py-3 shadow-[0px_4px_24px] shadow-black/25',
})
export function SelectOptions<T extends object>({
	className,
	...props
}: ComponentProps<typeof ListBox<T>>) {
	return (
		<Popover className="w-[var(--trigger-width)]">
			<ListBox
				{...props}
				className={(classNameProps) =>
					selectOptionsStyles({
						className:
							typeof className === 'function'
								? className(classNameProps)
								: className,
					})
				}
			/>
		</Popover>
	)
}

const selectOptionStyles = tv({
	base: 'cursor-pointer border-b border-gray-500/15 pb-4 pt-4 text-sm leading-normal first:pt-0 last:border-b-0 last:pb-0',
})

export function SelectOption({
	className,
	...props
}: ComponentProps<typeof ListBoxItem>) {
	return (
		<ListBoxItem
			{...props}
			className={(classNameProps) =>
				selectOptionStyles({
					className:
						typeof className === 'function'
							? className(classNameProps)
							: className,
				})
			}
		/>
	)
}

export const SelectValue = RACSelectValue
