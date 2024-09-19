import type { ObjectFactory } from './utils'
import { faker } from '@faker-js/faker'

export const makeUser: ObjectFactory<{
	name: string
	email: string
	password: string
}> = (overrides = {}) => {
	const name = overrides?.name ?? faker.person.fullName()
	const email = overrides?.email ?? faker.internet.email()
	const password = overrides?.password ?? faker.internet.password()

	return {
		name,
		email,
		password,
	}
}
