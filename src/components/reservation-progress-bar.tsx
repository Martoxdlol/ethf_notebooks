import dayjs from 'dayjs'
import {
    times,
    timestampToTime,
    timeToFactor,
    timeToValue,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

export function ReservationProgressBar(props: {
    start: number
    end: number
    withNotebooks?: boolean

    opacityOutOfRange?: boolean
}) {
    const minFactor = timeToFactor(timestampToTime(props.start))
    const maxFactor = timeToFactor(timestampToTime(props.end))

    const nowValue = timestampToTime(Date.now())
    const nowFactor = timeToFactor(nowValue)

    const inRange = Date.now() >= props.start && Date.now() <= props.end

    const isToday = dayjs(props.start).isSame(Date.now(), 'day')

    return (
        <div className='relative rounded-2xl'>
            <div className='absolute right-0 bottom-0 left-0 h-1 bg-primary/5' />
            {times.map((time) => {
                const factor = timeToFactor(time)

                if (
                    factor === 0 ||
                    factor === 1 ||
                    factor === minFactor ||
                    factor === maxFactor
                ) {
                    return null
                }

                return (
                    <div
                        key={timeToValue(time)}
                        style={{ marginLeft: `${factor * 100}%` }}
                        className={cn(
                            'transform-[translateX(-50%)] absolute bottom-0 left-0 h-1 w-0.5 bg-blue-300',
                            {
                                'bg-transparent':
                                    !inRange && props.withNotebooks,
                            },
                        )}
                    />
                )
            })}

            {nowFactor >= 0 && nowFactor <= 1 && isToday && (
                <div
                    className='absolute bottom-0 left-0 h-3 w-0.5 bg-red-500'
                    style={{ marginLeft: `${nowFactor * 100}%` }}
                />
            )}

            <div
                className={cn(
                    'flex justify-between border-blue-500 border-b-4 text-primary/60 text-xs',
                    {
                        'border-red-500': !inRange && props.withNotebooks,
                        'opacity-30':
                            !isToday &&
                            !props.withNotebooks &&
                            props.opacityOutOfRange,
                    },
                )}
                style={{
                    marginLeft: `${minFactor * 100}%`,
                    width: `${(maxFactor - minFactor) * 100}%`,
                }}
            >
                <p>{dayjs(props.start).format('HH:mm')}</p>
                <p>{dayjs(props.end).format('HH:mm')}</p>
            </div>
        </div>
    )
}
