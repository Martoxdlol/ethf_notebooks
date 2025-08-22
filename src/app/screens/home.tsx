import dayjs from 'dayjs'
import { useMemo } from 'react'
import { api } from '@/lib/api-client'
import { useHardware } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { Hardware } from '@/server/inventory'

import 'dayjs/locale/es'
import { Link, useSearchParams } from 'react-router'
import { ReservationProgressBar } from '@/components/reservation-progress-bar'

dayjs.locale('es')
export function HomeScreen() {
    const [params] = useSearchParams()

    const from = params.get('desde')
    const to = params.get('hasta')

    const fromAsDate = from ? dayjs(from).toDate() : undefined
    const toAsDate = to ? dayjs(to).endOf('day').toDate() : undefined

    const { data: reservations } = api.listReservations.useQuery({
        from: fromAsDate?.getTime(),
        to: toAsDate?.getTime(),
    })

    const byDay = useMemo(() => {
        const byDay = new Map<string, typeof reservations>()

        for (const reservation of reservations ?? []) {
            const date = dayjs(reservation.from).format('YYYY-MM-DD')
            const dayReservations = byDay.get(date) ?? []
            dayReservations.push(reservation)
            byDay.set(date, dayReservations)
        }

        return byDay
    }, [reservations])

    const daysSorted = useMemo(() => {
        return Array.from(byDay.keys()).sort()
    }, [byDay])

    const hard = useHardware()

    return (
        <>
            {daysSorted.map((day) => {
                const dayReservations = byDay.get(day) ?? []

                const date = dayjs(day)

                const isToday = date.isSame(dayjs(), 'day')
                const isTomorrow = date.isSame(dayjs().add(1, 'day'), 'day')
                let title = date.format('dddd D [de] MMMM')
                if (isToday) {
                    title += ' - HOY'
                } else if (isTomorrow) {
                    title += ' - MAÑANA'
                }

                return (
                    <section key={day}>
                        <div className='sticky top-0 z-10 flex p-2'>
                            <h2 className='font-semibold text-sm'>{title}</h2>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
                            {dayReservations?.map((reservation) => (
                                <ReservationTile
                                    key={reservation.id}
                                    id={reservation.id}
                                    quantity={reservation.notebooksQuantity}
                                    user={reservation.name}
                                    course={reservation.course}
                                    place={reservation.place}
                                    start={reservation.from}
                                    end={reservation.to}
                                    hardware={
                                        hard.hardwareByReservationId.get(
                                            reservation.id,
                                        ) ?? []
                                    }
                                />
                            ))}
                        </div>
                    </section>
                )
            })}
        </>
    )
}

function ReservationTile(props: {
    id: string
    quantity: number
    user: string
    course: string
    place: string
    start: number
    end: number
    hardware: Hardware[]
}) {
    const inRange = Date.now() >= props.start && Date.now() <= props.end

    return (
        <Link
            className='block cursor-pointer p-3 hover:bg-primary/5 active:bg-primary/5'
            to={`/reservas/${props.id}`}
        >
            <div className='flex items-center gap-4 p-1 pb-0'>
                <div className='flex size-12 items-center justify-center rounded-full bg-primary/5 font-mono font-semibold text-lg'>
                    {props.quantity}
                </div>
                <div className='grow pb-1'>
                    <p className='font-semibold'>{props.user}</p>
                    <p className='text-xs opacity-60'>
                        {props.course} - {props.place}
                    </p>
                </div>
                {(inRange || props.hardware.length > 0) && (
                    <div
                        className={cn('flex flex-col items-center', {
                            'text-red-500': !inRange,
                        })}
                    >
                        <p className='font-semibold'>{props.hardware.length}</p>
                        <p className='text-xs'>en uso</p>
                    </div>
                )}
            </div>
            <ReservationProgressBar start={props.start} end={props.end} />
        </Link>
    )
}
