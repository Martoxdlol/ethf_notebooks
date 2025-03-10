import { DatePicker } from '@/components/date-picker'
import { api } from '@/lib/api-client'
import { type Time, encodeTime, times } from '@/lib/constants'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router'

export function AvailabilityScreen() {
    const [params, setParams] = useSearchParams()

    const dateStr = params.get('fecha')

    if (!dateStr) {
        return (
            <div className='flex size-full items-center justify-center'>
                <div className='w-[200px'>
                    <DatePicker
                        value={undefined}
                        onChange={(date) => {
                            if (!date) {
                                return
                            }
                            params.set('fecha', dayjs(date).format('YYYY-MM-DD'))
                            setParams(params)
                        }}
                        placeholder='Seleccionar fecha'
                    />
                </div>
            </div>
        )
    }

    return <AvailabilityRows date={dayjs(dateStr).toDate()} />
}

function AvailabilityRows(props: { date: Date }) {
    const date = {
        day: props.date.getDate(),
        month: props.date.getMonth() + 1,
        year: props.date.getFullYear(),
    }
    const ranges: { from: Time; to: Time }[] = []

    for (let i = 0; i < times.length - 1; i++) {
        const from = times[i]
        const to = times[i + 1]
        if (!(from && to)) {
            continue
        }

        ranges.push({ from, to })
    }

    const { data } = api.availabilityCheckRanges.useQuery(
        ranges.map(({ from, to }) => ({
            date,
            from,
            to,
        })),
    )

    return (
        <>
            <div className='mt-4 flex h-6 justify-around text-white'>
                <div className='flex h-full items-center bg-green-500 px-2'>Disponibles</div>
                <div className='flex h-full items-center bg-amber-500 px-2'>Reservadas</div>
                <div className='flex h-full items-center bg-gray-500 px-2'>No disponibles</div>
            </div>
            {ranges.map(({ from }, i) => {
                const availability = data?.[i]

                if (!availability) {
                    return null
                }

                return (
                    <div className='px-4 pt-2' key={encodeTime(from)}>
                        <p className='font-semibold text-sm'>{encodeTime(from)}</p>
                        <div className='flex h-6 font-semibold text-white'>
                            <div className='flex h-full items-center bg-green-500 px-2' style={{ flex: availability.available }}>
                                {availability.available}
                            </div>
                            <div className='flex h-full items-center bg-amber-500 px-2' style={{ flex: availability.reserved }}>
                                {availability.reserved}
                            </div>
                            <div className='flex h-full items-center bg-gray-500 px-2' style={{ flex: availability.unavailable }}>
                                {availability.unavailable}
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}
