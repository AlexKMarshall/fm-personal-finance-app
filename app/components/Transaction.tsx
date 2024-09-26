import clsx from 'clsx'
import { tv } from 'tailwind-variants'

const transactionStyles = tv({
	slots: {
		container: '@container',
		base: 'grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 @[18rem]:grid-cols-[2rem_1fr_auto]',
		category: 'text-xs leading-normal text-gray-500 [grid-area:category]',
		image: 'size-8 shrink-0 self-center rounded-full [grid-area:avatar]',
	},
	variants: {
		showCategory: {
			true: {
				base: '[grid-template-areas:"name_amount"_"category_date"] @[18rem]:[grid-template-areas:"avatar_name_amount"_"avatar_category_date"]',
			},
			false: {
				base: '[grid-template-areas:"name_amount"_"name_date"] @[18rem]:[grid-template-areas:"avatar_name_amount"_"avatar_name_date"]',
				category: 'hidden',
			},
		},
	},
})

export function Transaction({
	name,
	category,
	date,
	amount,
	avatar,
	showCategory,
}: {
	name: string
	category: string
	date: string
	amount: string
	avatar: string
	showCategory: boolean
}) {
	const direction = amount.startsWith('-') ? 'debit' : 'credit'
	const styles = transactionStyles({ showCategory })
	return (
		<div className={styles.container()}>
			<div className={styles.base()}>
				<img
					src={avatar}
					alt=""
					className="size-8 shrink-0 self-center rounded-full [grid-area:avatar]"
				/>
				<p className="text-sm font-bold leading-normal [grid-area:name]">
					{name}
				</p>
				<p className={styles.category()}>{category}</p>
				<p
					className={clsx(
						'justify-self-end text-sm font-bold leading-normal [grid-area:amount]',
						{
							'text-green': direction === 'credit',
						},
					)}
				>
					{amount}
				</p>
				<p className="justify-self-end text-xs leading-normal text-gray-500 [grid-area:date]">
					{date}
				</p>
			</div>
		</div>
	)
}
