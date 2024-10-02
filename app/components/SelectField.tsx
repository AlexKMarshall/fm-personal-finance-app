import { useInputControl } from '@conform-to/react'
import type { ComponentProps } from 'react'
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

const selectStyles = tv({
	base: 'group flex flex-col gap-1',
})

export function SelectField({
	className,
	control,
	...props
}: ComponentProps<typeof RACSelect> & {
	control: ReturnType<typeof useInputControl<string>>
}) {
	return (
		<RACSelect
			{...props}
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
	)
}

const selectTriggerStyles = tv({
	base: 'flex items-center justify-between gap-4 rounded-lg border border-beige-500 px-5 py-3 text-left text-sm text-gray-900',
})
export function SelectTrigger({
	className,
	children,
	...props
}: Omit<ComponentProps<typeof RACButton>, 'type'>) {
	return (
		<RACButton
			{...props}
			type="button"
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
