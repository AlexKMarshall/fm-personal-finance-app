import clsx from 'clsx'
import * as d3 from 'd3'
import { Fragment } from 'react/jsx-runtime'
import { getColor } from '~/utils/color'

export function Donut({
	values,
}: {
	values: Array<{
		id: string
		color: string
		/** Values will be plotted on the donut as a proportion of the total value */
		value: number
		/** A value between 0 and 1
		 * The higher the utilization, the more of the segment will be filled with the color
		 */
		utilization: number
	}>
}) {
	const pie = d3.pie<(typeof values)[number]>().value((d) => d.value)
	const arcs = pie(values)

	const outerRadius = 120
	const innerRadius = 80

	return (
		<svg viewBox={`0 0 ${outerRadius * 2} ${outerRadius * 2}`}>
			{arcs.map((arc) => {
				return (
					<Fragment key={arc.data.id}>
						<path
							transform={`translate(${outerRadius},${outerRadius})`}
							d={
								d3.arc()({
									...arc,
									innerRadius:
										innerRadius +
										(outerRadius - innerRadius) * (1 - arc.data.utilization),
									outerRadius,
								}) ?? undefined
							}
							fill="currentColor"
							className={getColor(arc.data.color).foreground}
						/>
						<path
							transform={`translate(${outerRadius},${outerRadius})`}
							d={
								d3.arc()({
									...arc,
									innerRadius,
									outerRadius:
										innerRadius +
										(outerRadius - innerRadius) * (1 - arc.data.utilization),
								}) ?? undefined
							}
							fill="currentColor"
							className={clsx(
								getColor(arc.data.color).foreground,
								'opacity-75',
							)}
						/>
					</Fragment>
				)
			})}
		</svg>
	)
}
