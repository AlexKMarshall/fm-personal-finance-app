import { parseWithZod } from '@conform-to/zod'
import { useSearchParams, Link } from '@remix-run/react'

import { z } from 'zod'
import { Icon } from './Icon'

const paginationSchema = z.object({
	page: z.coerce.number().optional().default(1),
	size: z.coerce.number().optional().default(10),
})

function setSearchParamsString(
	searchParams: URLSearchParams,
	{ page }: { page: number },
) {
	const newSearchParams = new URLSearchParams(searchParams)

	newSearchParams.set('page', String(page))

	return newSearchParams.toString()
}

export function Pagination({
	total,
}: {
	/** The total number of items */
	total: number
}) {
	const [searchParams] = useSearchParams()

	const parsedSearchParamsResult = parseWithZod(searchParams, {
		schema: paginationSchema,
	})
	if (parsedSearchParamsResult.status !== 'success') {
		throw new Error('Invalid search params')
	}
	const { page: currentPage, size } = parsedSearchParamsResult.value
	const pageCount = Math.ceil(total / size)

	return (
		<div className="flex justify-between gap-2 @container sm:gap-4">
			<div className="flex flex-grow justify-start @container">
				<Link
					className="group inline-flex min-h-10 min-w-10 items-center justify-center gap-4 rounded-lg border border-beige-500 text-sm leading-normal hover:bg-beige-500 hover:text-white @[8rem]:px-4 @[8rem]:py-2"
					to={{
						search: setSearchParamsString(searchParams, {
							page: Math.max(currentPage - 1, 1),
						}),
					}}
					preventScrollReset
				>
					<Icon
						name="CaretLeft"
						className="size-4 text-gray-500 group-hover:text-white"
					/>
					<span className="sr-only @[8rem]:not-sr-only">Prev</span>
				</Link>
			</div>
			<div className="hidden @xl:block">
				<PageNumbers
					currentPage={currentPage}
					pageCount={pageCount}
					maxPages={7}
				/>
			</div>
			<div className="hidden @sm:block @xl:hidden">
				<PageNumbers
					currentPage={currentPage}
					pageCount={pageCount}
					maxPages={5}
				/>
			</div>
			<div className="flex flex-grow justify-end @container">
				<Link
					to={{
						search: setSearchParamsString(searchParams, {
							page: Math.min(currentPage + 1, pageCount),
						}),
					}}
					preventScrollReset
					className="group inline-flex min-h-10 min-w-10 items-center justify-center gap-4 rounded-lg border border-beige-500 text-sm leading-normal hover:bg-beige-500 hover:text-white @[8rem]:px-4 @[8rem]:py-2"
				>
					<span className="sr-only @[8rem]:not-sr-only">Next</span>
					<Icon
						name="CaretRight"
						className="size-4 text-gray-500 group-hover:text-white"
					/>
				</Link>
			</div>
		</div>
	)
}

function PageNumbers({
	currentPage,
	pageCount,
	maxPages,
}: {
	currentPage: number
	pageCount: number
	maxPages: 5 | 7
}) {
	const [searchParams] = useSearchParams()
	const pages = generatePages({ currentPage, pageCount, maxPages })

	return (
		<div className="flex gap-2">
			{pages.map((page) => {
				if (typeof page === 'number') {
					return (
						<Link
							key={page}
							to={{
								search: setSearchParamsString(searchParams, { page }),
							}}
							aria-current={currentPage === page ? 'page' : undefined}
							preventScrollReset
							className="grid aspect-square size-10 place-items-center rounded-lg border border-beige-500 hover:bg-beige-500 hover:text-white aria-[current]:border-transparent aria-[current]:bg-gray-900 aria-[current]:text-white"
						>
							{page}
						</Link>
					)
				}
				return (
					<span
						className="grid aspect-square size-10 place-items-center rounded-lg border border-beige-500"
						key={page}
					>
						&hellip;
					</span>
				)
			})}
		</div>
	)
}

function getRange(start: number, end: number) {
	return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

/**
 * Code sourced from @jorrit91 https://gist.github.com/kottenator/9d936eb3e4e3c3e02598?permalink_comment_id=3238804#gistcomment-3238804
 */
function generatePages({
	currentPage,
	pageCount,
	maxPages = 7,
}: {
	currentPage: number
	pageCount: number
	maxPages?: 5 | 7
}) {
	let delta: number = 0
	if (pageCount <= maxPages) {
		// delta === 7: [1 2 3 4 5 6 7]
		// delta === 5: [1 2 3 4 5]
		delta = maxPages
	} else {
		// Case when maxPages is 7
		// delta === 2: [1 ... 4 5 6 ... 10]
		// delta === 4: [1 2 3 4 5 ... 10]
		// Case when maxPages is 5
		// delta === 0: [1 ... 4 ...10]
		// delta === 2: [1 2 3 ... 10]
		// delta === 2: [1 ...8 9 10]
		if (maxPages === 7) {
			delta = currentPage > 4 && currentPage < pageCount - 3 ? 2 : 4
		} else if (maxPages === 5) {
			delta = currentPage > 2 && currentPage < pageCount - 1 ? 0 : 2
		}
	}

	const range = {
		start: Math.round(currentPage - delta / 2),
		end: Math.round(currentPage + delta / 2),
	}

	if (range.start - 1 === 1 || range.end + 1 === pageCount) {
		range.start += 1
		range.end += 1
	}

	let pages: Array<number | 'skip-left' | 'skip-right'> =
		currentPage > delta
			? getRange(
					Math.min(range.start, pageCount - delta),
					Math.min(range.end, pageCount),
				)
			: getRange(1, Math.min(pageCount, delta + 1))

	const withDots = (
		value: number,
		pair: Array<number | 'skip-left' | 'skip-right'>,
	) => (pages.length + 1 !== pageCount ? pair : [value])

	if (pages[0] !== 1) {
		pages = withDots(1, [1, 'skip-left']).concat(pages)
	}

	const currentLastPage = pages.at(-1)

	if (typeof currentLastPage === 'number' && currentLastPage < pageCount) {
		pages = pages.concat(withDots(pageCount, ['skip-right', pageCount]))
	}

	return pages
}
