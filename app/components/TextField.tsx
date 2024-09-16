import type { ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

import { forwardRef } from 'react'
import { InputContext } from './Input'
import { LabelContext } from './Label'
import { FieldDescriptionContext } from './FieldDescription'

const textFieldStyles = tv({
	base: 'flex flex-col gap-1',
})

export const TextField = forwardRef<
	HTMLDivElement,
	Pick<ComponentProps<'div'>, 'children' | 'className'> & {
		id: string
		descriptionId?: string
	}
>(function TextField(
	{ className, children, id, descriptionId, ...props },
	ref,
) {
	return (
		<div ref={ref} className={textFieldStyles({ className })} {...props}>
			<InputContext.Provider value={{ id, 'aria-describedby': descriptionId }}>
				<LabelContext.Provider value={{ htmlFor: id }}>
					<FieldDescriptionContext.Provider value={{ id: descriptionId }}>
						{children}
					</FieldDescriptionContext.Provider>
				</LabelContext.Provider>
			</InputContext.Provider>
		</div>
	)
})
