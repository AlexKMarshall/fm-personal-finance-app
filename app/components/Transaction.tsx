import { tv } from 'tailwind-variants'

const transactionStyles = tv({
	slots: {
		container: '@container',
		base: 'grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 @[18rem]:grid-cols-[2rem_1fr_auto]',
		category: 'text-xs leading-normal text-gray-500 [grid-area:category]',
		image:
			'hidden size-8 shrink-0 self-center rounded-full [grid-area:avatar] @[18rem]:block',
		name: 'font-bold leading-normal [grid-area:name]',
		amount: 'justify-self-end font-bold leading-normal [grid-area:amount]',
		date: 'justify-self-end text-xs leading-normal text-gray-500 [grid-area:date]',
	},
	variants: {
		showCategory: {
			true: {
				base: '[grid-template-areas:"name_amount"_"category_date"] @[18rem]:[grid-template-areas:"avatar_name_amount"_"avatar_category_date"]',
				name: 'text-sm',
				amount: 'text-sm',
			},
			false: {
				base: '[grid-template-areas:"name_amount"_"name_date"] @[18rem]:[grid-template-areas:"avatar_name_amount"_"avatar_name_date"]',
				category: 'hidden',
				name: 'text-xs',
				amount: 'text-xs',
			},
		},
		direction: {
			debit: {},
			credit: {
				amount: 'text-green',
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
}: {
	name: string
	category?: string
	date: string
	amount: string
	avatar: string
	showCategory: boolean
}) {
	const direction = amount.startsWith('-') ? 'debit' : 'credit'
	const showCategory = Boolean(category)
	const styles = transactionStyles({ showCategory, direction })
	return (
		<div className={styles.container()}>
			<div className={styles.base()}>
				<img src={avatar} alt="" className={styles.image()} />
				<p className={styles.name()}>{name}</p>
				{showCategory ? <p className={styles.category()}>{category}</p> : null}
				<p className={styles.amount()}>{amount}</p>
				<p className={styles.date()}>{date}</p>
			</div>
		</div>
	)
}
