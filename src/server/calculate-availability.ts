import { and, gt, lt, or } from 'drizzle-orm'
import { type DBTX, schema } from './db'
import { type HardwareResponse, getReservationIdByNotes, listHardware } from './inventory'

export async function calculateAvailabilityRanges(opts: { db: DBTX; ranges: { from: number; to: number }[] }) {
    if (opts.ranges.length === 0) {
        return []
    }

    // Encontrar reservas que estén total o parcialmente dentro del rango de fechas
    const relevantReservations = await opts.db.query.reservation.findMany({
        where: or(...opts.ranges.map((r) => and(gt(schema.reservation.to, r.from), lt(schema.reservation.from, r.to)))),
        columns: {
            id: true,
            from: true,
            to: true,
            notebooksQuantity: true,
        },
    })

    // Información de hardware desde el inventario
    const hardware = await listHardware()

    return opts.ranges.map((range) => ({
        range,
        ...calculateAvailabilityInternal({
            from: range.from,
            to: range.to,
            hardware,
            reservations: relevantReservations,
        }),
    }))
}

export async function calculateAvailability(opts: { db: DBTX; from: number; to: number }) {
    return (await calculateAvailabilityRanges({ db: opts.db, ranges: [{ from: opts.from, to: opts.to }] }))[0]!
}

function calculateAvailabilityInternal(opts: {
    from: number
    to: number
    hardware: HardwareResponse
    reservations: { id: string; from: number; to: number; notebooksQuantity: number }[]
}) {
    const { hardware } = opts

    const relevantReservations = opts.reservations.filter((reservation) => reservation.from <= opts.to && reservation.to > opts.from)

    // Cantidad de notebooks entregadas por reserva
    const checkedOutByReservation = new Map<string, number>()
    const unavailableHardware = new Set<string>()

    // Calcular `checkedOutByReservation`
    for (const hard of hardware.rows) {
        if (!hard.assigned_to) {
            continue
        }

        const reservationId = getReservationIdByNotes(hard.notes)

        if (reservationId) {
            // Se encontró una reserva asociada al hardware
            checkedOutByReservation.set(reservationId, (checkedOutByReservation.get(reservationId) ?? 0) + 1)
        } else {
            // No se encontró una reserva asociada al hardware
            if (!hard.expected_checkin) {
                unavailableHardware.add(hard.asset_tag)
                continue
            }

            const expectedCheckIn = new Date(`${hard.expected_checkin}T00:00:00`).getTime()

            if (expectedCheckIn > opts.from) {
                unavailableHardware.add(hard.asset_tag)
            }
        }
    }

    // Timestamps relevantes para el cálculo
    const timeStamps = new Set<number>()
    // Agregar los timestamps de inicio y fin de cada reserva
    for (const reservation of relevantReservations) {
        timeStamps.add(reservation.from)
        timeStamps.add(reservation.to)
    }

    const reservedQuantityByTimeStamp = new Map<number, number>()

    for (const timeStamp of timeStamps) {
        const reservationsInTimeStamp = relevantReservations.filter(
            (reservation) => reservation.from <= timeStamp && reservation.to > timeStamp,
        )

        const reservedQuantity = reservationsInTimeStamp.reduce(
            (acc, reservation) => acc + Math.max(reservation.notebooksQuantity, checkedOutByReservation.get(reservation.id) ?? 0),
            0,
        )

        reservedQuantityByTimeStamp.set(timeStamp, reservedQuantity)
    }

    const maxAvailable = hardware.rows.length - unavailableHardware.size
    const maxReserved = Math.max(0, ...reservedQuantityByTimeStamp.values())

    const total = hardware.rows.length
    const minusUnavailable = total - unavailableHardware.size
    const minusReserved = Math.max(minusUnavailable - maxReserved, 0)

    return {
        available: Math.max(minusReserved, 0),
        reserved: minusUnavailable - minusReserved,
        reservable: minusUnavailable,
        total,
        unavailable: unavailableHardware.size,
        unavailableHardware: Array.from(unavailableHardware),
    }
}
