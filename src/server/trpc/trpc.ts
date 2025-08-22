import { initTRPC, TRPCError } from '@trpc/server'
import SuperJSON from 'superjson'
import type { Strings } from '../../lib/strings'
import type { AuthType } from '../auth'
import type { DBType } from '../db'
import { getUser } from '../inventory'

export type TRPCContext = {
    req: Request
    db: DBType
    auth: AuthType
    strings: Strings
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.context<TRPCContext>().create({
    transformer: SuperJSON,
})

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Export reusable procedure that checks if the user is authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const session = await ctx.auth.api.getSession({ headers: ctx.req.headers })

    if (!session) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
        })
    }

    const inventoryUser = await getUser(session.user.email)

    const isAdmin =
        inventoryUser?.groups?.rows.some(
            (group) => group.name === 'notebooks_app_admin',
        ) ?? false

    return next({
        ctx: {
            ...ctx,
            session: {
                ...session,
            },
            inventoryUser,
            isAdmin,
        },
    })
})
