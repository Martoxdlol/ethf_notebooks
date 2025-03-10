import { api } from '@/lib/api-client'
import { timeToFactor, timeToValue, times, timestampToTime } from '@/lib/constants'
import { useHardware } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { Hardware } from '@/server/inventory'
import dayjs from 'dayjs'
import { useMemo } from 'react'

import 'dayjs/locale/es'
import { useSearchParams } from 'react-router'
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
                                    quantity={reservation.notebooksQuantity}
                                    user={reservation.name}
                                    course={reservation.course}
                                    place={reservation.place}
                                    start={reservation.from}
                                    end={reservation.to}
                                    hardware={hard.hardwareByReservationId.get(reservation.id) ?? []}
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
    quantity: number
    user: string
    course: string
    place: string
    start: number
    end: number
    hardware: Hardware[]
}) {
    const minFactor = timeToFactor(timestampToTime(props.start))
    const maxFactor = timeToFactor(timestampToTime(props.end))

    const nowValue = timestampToTime(Date.now())
    const nowFactor = timeToFactor(nowValue)

    const inRange = Date.now() >= props.start && Date.now() <= props.end

    return (
        <div className='cursor-pointer p-3 hover:bg-primary/5 active:bg-primary/5'>
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
            <div className='relative rounded-2xl'>
                <div className='absolute right-0 bottom-0 left-0 h-1 bg-primary/5' />
                {times.map((time) => {
                    const factor = timeToFactor(time)

                    if (factor === 0 || factor === 1 || factor === minFactor || factor === maxFactor) {
                        return null
                    }

                    return (
                        <div
                            key={timeToValue(time)}
                            style={{ marginLeft: `${factor * 100}%` }}
                            className='transform-[translateX(-50%)] absolute bottom-0 left-0 h-1 w-0.5 bg-blue-300'
                        />
                    )
                })}

                {nowFactor >= 0 && nowFactor <= 1 && (
                    <div className='absolute bottom-0 left-0 h-3 w-0.5 bg-red-500' style={{ marginLeft: `${nowFactor * 100}%` }} />
                )}

                <div
                    className='flex justify-between border-blue-500 border-b-4 text-primary/60 text-xs'
                    style={{
                        marginLeft: `${minFactor * 100}%`,
                        width: `${(maxFactor - minFactor) * 100}%`,
                    }}
                >
                    <p>{dayjs(props.start).format('HH:mm')}</p>
                    <p>{dayjs(props.end).format('HH:mm')}</p>
                </div>
            </div>
        </div>
    )
}
