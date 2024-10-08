import { colorMap } from '~/utils/color'
import { makeCategory } from './category'
import type { ObjectFactory } from './utils'
import { faker } from '@faker-js/faker'

const makeColor: ObjectFactory<{ name: string }> = (overrides) => {
	const name =
		overrides?.name ?? faker.helpers.arrayElement(Object.keys(colorMap))
	return {
		name,
	}
}

export const makeBudget: ObjectFactory<{
	amount: number
	createdAt: Date
	Category: ReturnType<typeof makeCategory>
	Color: ReturnType<typeof makeColor>
}> = (overrides) => {
	const amount =
		overrides?.amount ?? faker.number.int({ min: 10, max: 100_000 })
	const createdAt =
		overrides?.createdAt ?? new Date(faker.date.past().toISOString())
	const Category = makeCategory(overrides?.Category)
	const Color = makeColor(overrides?.Color)

	return {
		amount,
		createdAt,
		Category,
		Color,
	}
}
