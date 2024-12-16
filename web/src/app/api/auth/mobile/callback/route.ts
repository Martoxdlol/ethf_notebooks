import type { NextRequest } from 'next/server'
import { exchangeAuthorizationCodeForAccessToken } from '~/lib/auth-helpers'

export async function GET(req: NextRequest) {
    const u = new URL(req.url)

    const params = new URLSearchParams(u.search)

    const authorizationCode = params.get('code')

    if (!authorizationCode) {
        return new Response('Missing authorization code', { status: 400 })
    }

    const token = await exchangeAuthorizationCodeForAccessToken(authorizationCode)

    if (!token) {
        return new Response('Invalid authorization code', { status: 400 })
    }

    return new Response(token)
}
