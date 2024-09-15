import { createCookie, redirect } from '@remix-run/node'
import { environment } from './environment'
import { z } from 'zod'

const cookie = createCookie('auth', {
	secrets: [environment.cookieSecret],
	// 30 days
	maxAge: 30 * 24 * 60 * 60,
	httpOnly: true,
	secure: environment.nodeEnv === 'production',
	sameSite: 'lax',
})

const authCookieSchema = z.object({
	userId: z.string(),
})

async function getAuthFromRequest(request: Request) {
	const authCookie = await cookie.parse(request.headers.get('Cookie'))
	const parsedAuthCookieResult = authCookieSchema.safeParse(authCookie)
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
	const cookieHeader = await cookie.serialize(auth)
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
				'Set-Cookie': await cookie.serialize('', { maxAge: 0 }),
			},
		})
	}
	return auth
}
