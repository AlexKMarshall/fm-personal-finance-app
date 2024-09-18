import crypto from 'crypto'
import { createCookie, redirect } from '@remix-run/node'
import { environment } from './environment.server'
import { z } from 'zod'

const authCookie = createCookie('auth', {
	secrets: [environment.cookieSecret],
	// 30 days
	maxAge: 30 * 24 * 60 * 60,
	httpOnly: true,
	secure: environment.nodeEnv === 'production',
	sameSite: 'lax',
})

const authCookieSchema = z.object({
	userId: z.string(),
	name: z.string(),
})

export function serializeAuthCookie(auth: z.infer<typeof authCookieSchema>) {
	return authCookie.serialize(auth)
}

/**
 * Retrieves and validates authentication data from request cookies.
 *
 * @param request - The incoming HTTP request.
 * @returns Parsed authentication data or null if validation fails.
 */
export async function getAuthFromRequest(request: Request) {
	const parsedAuthCookieResult = authCookieSchema.safeParse(
		await authCookie.parse(request.headers.get('Cookie')),
	)
	if (!parsedAuthCookieResult.success) {
		return null
	}
	return parsedAuthCookieResult.data
}

/**
 * Sets authentication cookie on the response. Mutates the response object.
 *
 * @param response - The HTTP response object.
 * @param auth - The authentication data.
 * @returns The modified response with the authentication cookie.
 */
export async function setAuthOnResponse(
	response: Response,
	auth: z.infer<typeof authCookieSchema>,
) {
	const cookieHeader = await serializeAuthCookie(auth)
	response.headers.append('Set-Cookie', cookieHeader)
	return response
}

/**
 * Guarantees that the user is authenticated.
 * Otherwise, it redirects to the login page.
 *
 * @param request The incoming request.
 * @returns The user's authentication information.
 */
export async function requireAuthCookie(request: Request) {
	const auth = await getAuthFromRequest(request)
	if (!auth) {
		throw redirect('/login', {
			headers: {
				// Clear the cookie
				'Set-Cookie': await authCookie.serialize('', { maxAge: 0 }),
			},
		})
	}
	return auth
}

export function generateSalt() {
	return crypto.randomBytes(16).toString('hex')
}

export function hashPassword({
	password,
	salt,
}: {
	password: string
	salt: string
}) {
	return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}
