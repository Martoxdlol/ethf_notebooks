import { ReservationProgressBar } from '@/components/reservation-progress-bar'
import { api } from '@/lib/api-client'
import { useHardware } from '@/lib/hooks'
import { cn } from '@/lib/utils'

export function ListScreen() {
    const hard = useHardware()

    return (
        <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3'>
            {hard.hardware.map((hardware) => {
                const reservationId = hard.getReservationIdByTag(hardware.asset_tag)

                return (
                    <div key={hardware.id}>
                        <h2 className='text-lg'>{hardware.asset_tag}</h2>
                        <p className='text-xs opacity-60'>
                            {hardware.manufacturer?.name} {hardware.model?.name}
                        </p>
                        <p
                            className={cn('mt-1 text-sm', {
                                'text-amber-500': hardware.assigned_to,
                                'text-blue-500': !hardware.assigned_to,
                            })}
                        >
                            {hardware.assigned_to?.name ?? 'disponible'}
                        </p>
                        {reservationId && <ReservationRow reservationId={reservationId} />}
                    </div>
                )
            })}
        </div>
    )
}

function ReservationRow(props: { reservationId: string }) {
    const hard = useHardware()

    const { data: reservation } = api.getReservation.useQuery(props.reservationId, {
        enabled: !!props.reservationId,
    })

    if (!reservation) {
        return null
    }

    const notebooks = hard.hardwareByReservationId.get(reservation.id) ?? []

    return (
        <ReservationProgressBar
            start={reservation.from}
            end={reservation.to}
            withNotebooks={notebooks.length > 0}
            opacityOutOfRange={true}
        />
    )
}
