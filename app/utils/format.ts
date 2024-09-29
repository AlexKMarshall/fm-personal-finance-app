import { format } from 'date-fns'

export function formatCurrency(
	amountInCents: number,
	{ decimals = 2 }: { decimals?: number } = {},
) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(amountInCents / 100)
}

export function formatDate(date: Date | string) {
	return format(new Date(date), 'd MMMM yyyy')
}

export function formatDayOfMonth(date: Date | string) {
	return format(new Date(date), 'do')
}
