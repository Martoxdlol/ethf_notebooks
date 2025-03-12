import { api } from '@/lib/api-client'
import dayjs from 'dayjs'
import { Loader2Icon } from 'lucide-react'
import { Button } from './ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select'

export function ReservationPicker(props: {
    onChange: (value: string) => void
    value: string | undefined
    inventoryUserId?: number
}) {
    const { data, isPending } = api.listReservations.useQuery({
        from: dayjs().startOf('day').toDate().getTime(),
        to: dayjs().endOf('day').toDate().getTime(),
        inventoryUserId: props.inventoryUserId,
    })

    if (isPending) {
        return (
            <Button disabled={true} variant='outline' className='w-full' type='button'>
                <Loader2Icon className='animate-spin' />
            </Button>
        )
    }

    if (!data) {
        return (
            <Button disabled={true} type='button'>
                error
            </Button>
        )
    }

    return (
        <Select value={props.value} onValueChange={(v) => props.onChange(v)}>
            <SelectTrigger>
                <SelectValue placeholder='Buscar reserva' />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Reservas de hoy</SelectLabel>
                    {data?.map((u, i) => (
                        <SelectItem key={i} value={u.id.toString()}>
                            <p>
                                <span className='font-semibold'>{u.notebooksQuantity}</span> - de {dayjs(u.from).format('HH:mm')} a{' '}
                                {dayjs(u.to).format('HH:mm')}
                            </p>
                            <p>{u.name}</p>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
