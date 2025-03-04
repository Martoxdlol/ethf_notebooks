import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { schema } from '../db'
import { checkinId, checkoutId, getUserById, getUsers, listHardware } from '../inventory'
import { protectedProcedure, router } from './trpc'

export const appRouter = router({
    listAssets: protectedProcedure.query(() => {
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

    checkoutAssets: protectedProcedure
        .input(
            z.object({
                assetTags: z.array(z.string()),
                inventoryUserId: z.number(),
                reservationId: z.string().nullable(),
                from: z
                    .object({
                        hours: z.number(),
                        minutes: z.number(),
                    })
                    .nullable(),
                to: z
                    .object({
                        hours: z.number(),
                        minutes: z.number(),
                    })
                    .nullable(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No estas autorizado para realizar esta acción',
                })
            }

            const inventory = await listHardware()
            const assetsByTag = new Map(inventory.rows.map((h) => [h.asset_tag, h]))

            const year = new Date().getFullYear()
            const month = new Date().getMonth()
            const day = new Date().getDate()

            const to = new Date(year, month, day, input.to!.hours, input.to!.minutes)

            for (const tag of input.assetTags) {
                const id = assetsByTag.get(tag)?.id

                if (!id) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: `Notebook con tag ${tag} no encontrado`,
                    })
                }

                await checkoutId({
                    assigned_asset: id,
                    assigned_user: input.inventoryUserId,
                    checkout_by: ctx.session.user.name,
                    checkout_at: new Date(),
                    expected_checkin: to,
                    user: ctx.session.user.id,
                })
            }
        }),

    checkinAssets: protectedProcedure
        .input(
            z.object({
                assetTags: z.array(z.string()),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No estas autorizado para realizar esta acción',
                })
            }

            const inventory = await listHardware()
            const assetsByTag = new Map(inventory.rows.map((h) => [h.asset_tag, h]))

            for (const tag of input.assetTags) {
                const id = assetsByTag.get(tag)?.id

                if (!id) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: `Notebook con tag ${tag} no encontrado`,
                    })
                }

                await checkinId(id)
            }
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
