import type { ObjectFactory } from './utils'
import { faker } from '@faker-js/faker'

const makeCounterparty: ObjectFactory<{ name: string; avatarUrl: string }> = (
	overrides,
) => {
	const name = overrides?.name ?? faker.company.name()
	const avatarUrl = overrides?.avatarUrl ?? faker.image.avatar()
	return {
		name,
		avatarUrl,
	}
}

export const makeCategory: ObjectFactory<{ name: string }> = (overrides) => {
	const name = overrides?.name ?? faker.commerce.department()
	return {
		name,
	}
}

export const makeTransaction: ObjectFactory<{
	amount: number
	date: Date
	Counterparty: ReturnType<typeof makeCounterparty>
	Category: ReturnType<typeof makeCategory>
	isRecurring: boolean
}> = (overrides) => {
	const amount =
		overrides?.amount ?? faker.number.int({ min: 10, max: 100_000 })
	const date = overrides?.date ?? new Date(faker.date.past().toISOString())
	const Counterparty = overrides?.Counterparty ?? makeCounterparty()
	const Category = overrides?.Category ?? makeCategory()
	const isRecurring = overrides?.isRecurring ?? faker.datatype.boolean()
	return {
		amount,
		date,
		Counterparty,
		Category,
		isRecurring,
	}
}
