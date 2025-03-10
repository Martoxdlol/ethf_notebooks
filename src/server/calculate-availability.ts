import { and, gt, lt } from 'drizzle-orm'
import { type DBTX, schema } from './db'
import { getReservationIdByNotes, listHardware } from './inventory'

export async function calculateAvailability(opts: { db: DBTX; from: number; to: number }) {
    // Encontrar reservas que estén total o parcialmente dentro del rango de fechas
    const relevantReservations = await opts.db.query.reservation.findMany({
        where: and(gt(schema.reservation.to, opts.from), lt(schema.reservation.from, opts.to)),
        columns: {
            id: true,
            from: true,
            to: true,
            notebooksQuantity: true,
        },
    })

    // Información de hardware desde el inventario
    const hardware = await listHardware()

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

    const available = Math.max(maxAvailable - maxReserved, 0)

    return {
        available,
        maxAvailable,
        maxReserved,
        unavailableHardware: Array.from(unavailableHardware),
    }
}
