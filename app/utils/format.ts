import { format } from 'date-fns'

export function formatCurrency(amountInCents: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amountInCents / 100)
}

export function formatDate(date: Date | string) {
	return format(new Date(date), 'd MMMM yyyy')
}

export function formatDayOfMonth(date: Date | string) {
	return format(new Date(date), 'do')
}
