import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDatabase, type DBType } from '../db'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

export function createAuth(opts?: { db: DBType }) {
    return betterAuth({
        database: drizzleAdapter(opts?.db ?? createDatabase(), {
            provider: 'pg',
        }),
        socialProviders: {
            microsoft: {
                clientId: process.env.MICROSOFT_CLIENT_ID!,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
                tenantId: process.env.MICROSOFT_TENANT_ID!,
            },
        },
        baseURL: process.env.BASE_URL || 'http://localhost:5173',
        trustedOrigins: [BASE_URL, 'http://10.0.90.2:5173'],
    })
}

export type AuthType = ReturnType<typeof createAuth>
