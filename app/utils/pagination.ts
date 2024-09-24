/** Use for in-memory paginating of a data set */
export function paginate<T>(
	items: T[],
	{ page, size }: { page: number; size: number },
) {
	const start = (page - 1) * size
	const end = start + size
	const paginatedItems = items.slice(start, end)

	return {
		items: paginatedItems,
		count: items.length,
	}
}
