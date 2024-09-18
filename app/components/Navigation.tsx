import { NavLink } from '@remix-run/react'
import { forwardRef, type ComponentProps } from 'react'
import { Icon } from './Icon'

export const Navigation = forwardRef<HTMLElement, ComponentProps<'nav'>>(
	function Navigation(props, ref) {
		return <nav ref={ref} {...props} />
	},
)

export const NavigationItem = forwardRef<
	HTMLAnchorElement,
	ComponentProps<typeof NavLink> & { icon: ComponentProps<typeof Icon>['name'] }
>(function NavigationItem({ icon, children, ...props }, ref) {
	return (
		<NavLink ref={ref} {...props}>
			{(navLinkRenderProps) => (
				<>
					<Icon name={icon} className="size-6 text-gray-500" />
					{typeof children === 'function'
						? children(navLinkRenderProps)
						: children}
				</>
			)}
		</NavLink>
	)
})
