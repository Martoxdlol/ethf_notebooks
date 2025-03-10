import dayjs from 'dayjs'
import { CalendarDaysIcon, Settings2Icon } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { DatePicker } from './date-picker'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function HomeNavActions() {
    return (
        <>
            <Options />
            <AvailabilityCalendar />
        </>
    )
}

export function AvailabilityNavActions() {
    return (
        <>
            <AvailabilityCalendar />
        </>
    )
}

function Options() {
    const [params, setParams] = useSearchParams()

    function setDateParam(key: string, value?: Date) {
        if (value) {
            params.set(key, dayjs(value).format('YYYY-MM-DD'))
        } else {
            params.delete(key)
        }
        setParams(params)
    }

    function handleOnChangeFrom(date: Date | undefined) {
        setDateParam('desde', date)
    }

    function handleOnChangeTo(date: Date | undefined) {
        setDateParam('hasta', date)
    }

    const from = params.get('desde')
    const to = params.get('hasta')

    const fromAsDate = from ? dayjs(from).toDate() : undefined
    const toAsDate = to ? dayjs(to).toDate() : undefined

    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <Button size='icon' variant='ghost' type='button'>
                    <Settings2Icon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='flex flex-col gap-2 p-3'>
                <DatePicker placeholder='Desde' value={fromAsDate} onChange={handleOnChangeFrom} />
                <DatePicker placeholder={from ? 'Una semana' : 'Hasta'} value={toAsDate} onChange={handleOnChangeTo} />
            </PopoverContent>
        </Popover>
    )
}

function AvailabilityCalendar() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const date = params.get('fecha')

    return (
        <DatePicker
            value={dayjs(date).toDate()}
            onChange={(date) => navigate({ pathname: '/disponibilidad', search: `?fecha=${dayjs(date).format('YYYY-MM-DD')}` })}
        >
            <Button size='icon' variant='ghost' type='button'>
                <CalendarDaysIcon />
            </Button>
        </DatePicker>
    )
}
