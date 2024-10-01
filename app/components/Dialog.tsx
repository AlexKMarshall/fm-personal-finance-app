import type { ComponentProps } from 'react'
import {
	ModalOverlay,
	Dialog as RACDialog,
	DialogTrigger,
	Heading,
	Modal as RACModal,
} from 'react-aria-components'
import { Button } from './Button'
import { Icon } from './Icon'

export function Modal({
	isDismissable,
	...props
}: ComponentProps<typeof RACModal>) {
	return (
		<ModalOverlay
			isDismissable={isDismissable}
			className="fixed inset-0 grid place-items-center bg-black/50 p-5"
		>
			<RACModal {...props} />
		</ModalOverlay>
	)
}

export function Dialog({
	children,
	title,
	...props
}: ComponentProps<typeof RACDialog> & { title: string }) {
	return (
		<RACDialog
			{...props}
			className="flex max-w-xl flex-col gap-6 rounded-xl bg-white px-5 py-6"
		>
			{(renderProps) => (
				<>
					<div className="flex justify-between gap-6">
						<Heading slot="title" className="text-xl font-bold leading-tight">
							{title}
						</Heading>
						<Button
							appearance="tertiary"
							aria-label="Cancel"
							onPress={renderProps.close}
						>
							<Icon name="XCircle" className="size-6" />
						</Button>
					</div>
					{typeof children === 'function' ? children(renderProps) : children}
				</>
			)}
		</RACDialog>
	)
}

export { DialogTrigger }
