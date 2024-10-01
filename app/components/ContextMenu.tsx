import {
	MenuTrigger,
	Popover,
	Menu,
	MenuItem,
	Button,
} from 'react-aria-components'
import { Icon } from './Icon'
import type { ComponentProps, ReactNode } from 'react'
import { tv } from 'tailwind-variants'

const contextMenuStyles = tv({
	slots: {
		item: 'border-b border-gray-500/15 pb-4 pt-4 text-sm leading-normal first:pt-0 last:border-b-0 last:pb-0',
	},
})

export function ContextMenu({
	'aria-label': ariaLabel,
	children,
	className,
}: {
	'aria-label': string
	children: ReactNode
	className?: string
}) {
	return (
		<MenuTrigger>
			<Button aria-label={ariaLabel} className={className}>
				<Icon name="Ellipsis" className="size-4 text-gray-300" />
			</Button>
			<Popover>
				<Menu className="rounded-lg bg-white px-5 py-3 shadow-[0px_4px_24px] shadow-black/25">
					{children}
				</Menu>
			</Popover>
		</MenuTrigger>
	)
}

function ContextMenuItem({
	className,
	...props
}: ComponentProps<typeof MenuItem>) {
	const styles = contextMenuStyles()
	return (
		<MenuItem
			{...props}
			className={(classNameProps) =>
				styles.item({
					className:
						typeof className === 'function'
							? className(classNameProps)
							: className,
				})
			}
		/>
	)
}

ContextMenu.Item = ContextMenuItem
