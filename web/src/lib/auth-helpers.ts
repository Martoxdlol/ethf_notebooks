import { EncryptJWT, jwtDecrypt } from 'jose'
import { headers } from 'next/headers'
import { auth } from '~/auth'

export type AuthUser = {
    email: string
    name: string
    image: string | null
}

export type AuthSession = {
    user: AuthUser
}

export async function getSession(): Promise<AuthSession | null> {
    const session = await auth()

    if (session?.user?.email) {
        return {
            user: {
                email: session.user.email,
                name: session.user.name ?? session.user.email.split('@')[0],
                image: session.user.image ?? null,
            },
        }
    }

    const h = await headers()

    const bearer = h.get('authorization')

    if (!bearer) {
        return null
    }

    const token = /Bearer (.+)/.exec(bearer)?.[1]

    if (!token) {
        return null
    }

    const user = await verifyToken(token, 'access_token')

    if (!user) {
        return null
    }

    return { user }
}

let key: Promise<ArrayBuffer> | null = null

export async function getJWTKey() {
    if (key) {
        return new Uint8Array(await key)
    }

    if (!process.env.AUTH_SECRET) {
        throw new Error('AUTH_SECRET is not set')
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(process.env.AUTH_SECRET)
    key = global.crypto.subtle.digest('SHA-256', data)

    return new Uint8Array(await key)
}

export async function decodeJwt(token: string) {
    return await jwtDecrypt(token, await getJWTKey()).catch(() => null)
}

export async function createAuthorizationCodeToken(opts: {
    email: string
    name: string
    image: string | null
}) {
    return await new EncryptJWT({
        sub: opts.email,
        name: opts.name,
        image: opts.image,
        type: 'authorization_code',
    })
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime('1m')
        .encrypt(await getJWTKey())
}

export async function createAccessToken(opts: {
    email: string
    name: string
    image: string | null
}) {
    return await new EncryptJWT({
        sub: opts.email,
        name: opts.name,
        image: opts.image,
        type: 'access_token',
    })
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime('1y')
        .encrypt(await getJWTKey())
}

export async function verifyToken(token: string, type: string): Promise<AuthUser | null> {
    const jwt = (await decodeJwt(token))?.payload as {
        sub?: string
        type?: string
        name?: string
        image?: string
    }

    if (!jwt || jwt.type !== type || !jwt.sub || !jwt.name) {
        return null
    }

    return {
        email: jwt.sub.toString(),
        name: jwt.name.toString(),
        image: jwt.image?.toString() ?? null,
    }
}

export async function exchangeAuthorizationCodeForAccessToken(code: string): Promise<string | null> {
    const data = await verifyToken(code, 'authorization_code')
    if (!data) {
        return null
    }

    return createAccessToken(data)
}
