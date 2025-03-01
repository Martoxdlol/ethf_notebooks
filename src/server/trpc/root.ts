import { listHardware } from '../inventory'
import { protectedProcedure, router } from './trpc'

export const appRouter = router({
    hello: protectedProcedure.query(({ ctx }) => {
        return `Hello, ${ctx.session.user.name}!`
    }),

    listAssets: protectedProcedure.query(({ ctx }) => {
        return listHardware()
    }),
})

export type AppRouter = typeof appRouter
