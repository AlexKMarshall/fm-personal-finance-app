import type { ObjectFactory } from './utils'
import { faker } from '@faker-js/faker'

export const makeCategory: ObjectFactory<{ name: string }> = (overrides) => {
	const name = overrides?.name ?? faker.commerce.department()
	return {
		name,
	}
}
