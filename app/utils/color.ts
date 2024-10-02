export const colorMap: Record<
	string,
	{ background: string; foreground: string }
> = {
	Green: { background: 'bg-green', foreground: 'text-green' },
	Yellow: { background: 'bg-yellow', foreground: 'text-yellow' },
	Cyan: { background: 'bg-cyan', foreground: 'text-cyan' },
	Navy: { background: 'bg-navy', foreground: 'text-navy' },
	Red: { background: 'bg-red', foreground: 'text-red' },
	Purple: { background: 'bg-purple', foreground: 'text-purple' },
	Pink: { background: 'bg-pink', foreground: 'text-pink' },
	Turquoise: { background: 'bg-turquoise', foreground: 'text-turquoise' },
	Brown: { background: 'bg-brown', foreground: 'text-brown' },
	Magenta: { background: 'bg-magenta', foreground: 'text-magenta' },
	Blue: { background: 'bg-blue', foreground: 'text-blue' },
	'Navy Gray': { background: 'bg-navyGray', foreground: 'text-navyGray' },
	'Army Green': { background: 'bg-armyGreen', foreground: 'text-armyGreen' },
	Gold: { background: 'bg-gold', foreground: 'text-gold' },
	Orange: { background: 'bg-orange', foreground: 'text-orange' },
	Beige: { background: 'bg-beige-100', foreground: 'text-beige-100' },
}

export function getColor(colorName: string) {
	return (
		colorMap[colorName] ?? {
			background: 'bg-gray-500',
			foreground: 'text-gray-500',
		}
	)
}
