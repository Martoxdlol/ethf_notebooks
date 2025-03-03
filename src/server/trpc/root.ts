import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { schema } from '../db'
import { getUserById, getUsers, listHardware } from '../inventory'
import { protectedProcedure, router } from './trpc'

export const appRouter = router({
    listAssets: protectedProcedure.query(({ ctx }) => {
        return listHardware()
    }),

    listUsers: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.inventoryUser) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            })
        }

        const users = ctx.isAdmin ? await getUsers() : []

        users.sort((a, b) => a.name.localeCompare(b.name))

        users.sort((a, b) => {
            if (a.id === ctx.inventoryUser!.id) {
                return -1
            }

            if (b.id === ctx.inventoryUser!.id) {
                return 1
            }

            return 0
        })

        return {
            isAdmin: ctx.isAdmin,
            users,
            me: ctx.inventoryUser!,
        }
    }),

    listReservations: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.inventoryUser) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            })
        }

        const reservations = await ctx.db
            .select({
                id: schema.reservation.id,
                from: schema.reservation.from,
                to: schema.reservation.to,
                place: schema.reservation.place,
                course: schema.reservation.course,
                email: schema.reservation.inventoryUserEmail,
                name: schema.reservation.inventoryUserName,
                notebooksQuantity: schema.reservation.notebooksQuantity,
                notes: schema.reservation.notes,
            })
            .from(schema.reservation)
        return reservations
    }),

    createReservation: protectedProcedure
        .input(
            z.object({
                inventoryUserId: z.number().nullable(),
                date: z.object({
                    year: z.number(),
                    month: z.number(),
                    day: z.number(),
                }),
                from: z.object({
                    hours: z.number(),
                    minutes: z.number(),
                }),
                to: z.object({
                    hours: z.number(),
                    minutes: z.number(),
                }),
                place: z.string(),
                course: z.string(),
                notes: z.string(),
                notebooksQuantity: z.number(),
                idempotencyKey: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const from = new Date(input.date.year, input.date.month - 1, input.date.day, input.from.hours, input.from.minutes)
            const to = new Date(input.date.year, input.date.month - 1, input.date.day, input.to.hours, input.to.minutes)

            if (input.inventoryUserId && !ctx.isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No estas autorizado para realizar esta acción',
                })
            }

            const inventoryUserId = input.inventoryUserId ?? ctx.inventoryUser?.id

            if (!inventoryUserId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No estas autorizado para realizar esta acción',
                })
            }

            const inventoryUser = await getUserById(inventoryUserId)

            if (!inventoryUser) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Usuario no encontrado',
                })
            }

            const r = await ctx.db
                .insert(schema.reservation)
                .values({
                    inventoryUserName: inventoryUser.name,
                    inventoryUserEmail: inventoryUser.email,
                    from: from.getTime(),
                    to: to.getTime(),
                    inventoryUserId,
                    localUserId: ctx.session.user.id,
                    notebooksQuantity: input.notebooksQuantity,
                    course: input.course,
                    place: input.place,
                    notes: input.notes,
                    idempotencyKey: input.idempotencyKey,
                })
                .returning({
                    id: schema.reservation.id,
                })

            return r[0]!
        }),
})

export type AppRouter = typeof appRouter
