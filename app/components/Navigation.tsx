import { NavLink } from '@remix-run/react'
import { forwardRef, type ComponentProps } from 'react'
import { Icon } from './Icon'
import { tv } from 'tailwind-variants'

const navigationStyles = tv({
	base: 'flex justify-between overflow-x-auto bg-gray-900',
})

export const Navigation = forwardRef<HTMLElement, ComponentProps<'nav'>>(
	function Navigation({ className, ...props }, ref) {
		return (
			<nav ref={ref} className={navigationStyles({ className })} {...props} />
		)
	},
)

const navigationItemStyles = tv({
	base: 'group flex w-40 min-w-max flex-col items-center gap-1 rounded-t-lg border-b-4 border-transparent px-5 pb-2 pt-2 text-center text-xs font-bold leading-normal text-gray-300 hover:text-gray-100 aria-[current]:border-green aria-[current]:bg-white aria-[current]:text-gray-900',
})

export const NavigationItem = forwardRef<
	HTMLAnchorElement,
	ComponentProps<typeof NavLink> & { icon: ComponentProps<typeof Icon>['name'] }
>(function NavigationItem({ icon, children, className, ...props }, ref) {
	return (
		<NavLink
			ref={ref}
			className={(navLinkProps) =>
				navigationItemStyles({
					className:
						typeof className === 'function'
							? className(navLinkProps)
							: className,
				})
			}
			{...props}
		>
			{(navLinkRenderProps) => (
				<>
					<Icon
						name={icon}
						className="size-6 group-aria-[current]:text-green"
					/>
					<span className="sr-only sm:not-sr-only">
						{typeof children === 'function'
							? children(navLinkRenderProps)
							: children}
					</span>
				</>
			)}
		</NavLink>
	)
})
