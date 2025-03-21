import { TRPCError } from '@trpc/server'
import dayjs from 'dayjs'
import { and, eq, gt, gte, lte } from 'drizzle-orm'
import { createId } from 'm3-stack/helpers'
import { z } from 'zod'
import { calculateAvailability, calculateAvailabilityRanges } from '../calculate-availability'
import { schema } from '../db'
import { checkinId, checkoutId, getUserById, getUsers, listHardware } from '../inventory'
import { protectedProcedure, router } from './trpc'

export const appRouter = router({
    me: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.inventoryUser) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            })
        }

        return {
            ...ctx.inventoryUser,
            isAdmin: ctx.isAdmin,
        }
    }),

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

    listReservations: protectedProcedure
        .input(
            z
                .object({
                    from: z.number().optional(),
                    to: z.number().optional(),
                    inventoryUserId: z.number().optional(),
                })
                .optional(),
        )
        .query(async ({ ctx, input }) => {
            const from = input?.from ?? dayjs().startOf('day').valueOf()
            const to = input?.to ?? dayjs(from).add(1, 'week').valueOf()

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
                .where(
                    and(
                        gte(schema.reservation.from, from),
                        lte(schema.reservation.from, to),
                        ctx.isAdmin ? undefined : eq(schema.reservation.inventoryUserId, ctx.inventoryUser.id),
                        input?.inventoryUserId ? eq(schema.reservation.inventoryUserId, input.inventoryUserId) : undefined,
                    ),
                )

            return reservations
        }),

    availabilityCheck: protectedProcedure
        .input(
            z.object({
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
            }),
        )
        .query(async ({ ctx, input }) => {
            const from = new Date(input.date.year, input.date.month - 1, input.date.day, input.from.hours, input.from.minutes)
            const to = new Date(input.date.year, input.date.month - 1, input.date.day, input.to.hours, input.to.minutes)

            return calculateAvailability({
                db: ctx.db,
                from: from.getTime(),
                to: to.getTime(),
            })
        }),

    availabilityCheckRanges: protectedProcedure
        .input(
            z.array(
                z.object({
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
                }),
            ),
        )
        .query(async ({ ctx, input }) => {
            return calculateAvailabilityRanges({
                db: ctx.db,
                ranges: input.map((range) => {
                    const from = new Date(range.date.year, range.date.month - 1, range.date.day, range.from.hours, range.from.minutes)
                    const to = new Date(range.date.year, range.date.month - 1, range.date.day, range.to.hours, range.to.minutes)

                    return {
                        from: from.getTime(),
                        to: to.getTime(),
                    }
                }),
            })
        }),

    checkoutAssets: protectedProcedure
        .input(
            z.object({
                assetTags: z.array(z.string()),
                inventoryUserId: z.number().optional(),
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

            let reservationId = ''
            let inventoryUserId = -1

            let from: Date
            let to: Date

            if (input.reservationId) {
                const reservation = await ctx.db.query.reservation.findFirst({
                    where: eq(schema.reservation.id, input.reservationId),
                    columns: {
                        id: true,
                        from: true,
                        to: true,
                        inventoryUserId: true,
                    },
                })

                if (!reservation) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Reserva no encontrada',
                    })
                }

                reservationId = reservation.id
                inventoryUserId = reservation.inventoryUserId
                from = new Date(reservation.from)
                to = new Date(reservation.to)
            } else {
                if (!(input.from && input.to && input.inventoryUserId)) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'from y to son requeridos si reservationId no esta presente',
                    })
                }

                from = new Date(year, month, day, input.from!.hours, input.from!.minutes)
                to = new Date(year, month, day, input.to!.hours, input.to!.minutes)

                const user = await getUserById(input.inventoryUserId)
                inventoryUserId = input.inventoryUserId

                if (!user) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Usuario no encontrado',
                    })
                }

                const id = createId()
                await ctx.db.insert(schema.reservation).values({
                    course: 'Cualquiera',
                    place: 'Cualquiera',
                    from: from.getTime(),
                    to: to.getTime(),
                    id,
                    inventoryUserId: input.inventoryUserId,
                    inventoryUserName: user.name,
                    inventoryUserEmail: user.email,
                    localUserId: ctx.session.user.id,
                    notebooksQuantity: input.assetTags.length,
                    idempotencyKey: createId(),
                })

                reservationId = id
            }

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
                    assigned_user: inventoryUserId,
                    checkout_by: ctx.session.user.name,
                    checkout_at: new Date(),
                    expected_checkin: to,
                    user: ctx.session.user.id,
                    reservation_id: reservationId,
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
            let from = new Date(input.date.year, input.date.month - 1, input.date.day, input.from.hours, input.from.minutes)
            const to = new Date(input.date.year, input.date.month - 1, input.date.day, input.to.hours, input.to.minutes)

            const ONE_HOUR = 60 * 60 * 1000
            if (from.getTime() < Date.now() - ONE_HOUR) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No puedes reservar en el pasado',
                })
            }

            if (from.getTime() < Date.now() && from.getTime() > Date.now() - ONE_HOUR) {
                from = new Date()
            }

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

    getReservation: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        const reservation = await ctx.db.query.reservation.findFirst({
            where: and(
                eq(schema.reservation.id, input),
                ctx.isAdmin ? undefined : eq(schema.reservation.inventoryUserId, ctx.inventoryUser!.id),
            ),
        })

        if (!reservation) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Reserva no encontrada',
            })
        }

        return reservation
    }),

    deleteReservation: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        if (!ctx.isAdmin) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'No estas autorizado para realizar esta acción',
            })
        }

        const r = await ctx.db
            .delete(schema.reservation)
            .where(
                and(
                    eq(schema.reservation.id, input),
                    ctx.isAdmin ? undefined : eq(schema.reservation.inventoryUserId, ctx.inventoryUser!.id),
                    gt(
                        schema.reservation.from,
                        Date.now() +
                            // 1 hour
                            60 * 60 * 1000,
                    ),
                ),
            )
            .returning()

        return r.length > 0
    }),
})

export type AppRouter = typeof appRouter
