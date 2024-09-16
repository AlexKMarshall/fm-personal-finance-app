import { z } from 'zod'

const schema = z.object({
	cookieSecret: z.string().min(32),
	nodeEnv: z
		.union([z.literal('development'), z.literal('production')])
		.default('development'),
})

const rawEnvironment = {
	cookieSecret: process.env.COOKIE_SECRET,
	nodeEnv: process.env.NODE_ENV,
} satisfies Record<keyof z.infer<typeof schema>, unknown>

const parsedEnvironmentResult = schema.safeParse(rawEnvironment)

if (!parsedEnvironmentResult.success) {
	throw new Error('Environment variables invalid', {
		cause: parsedEnvironmentResult.error,
	})
}

export const environment = parsedEnvironmentResult.data
