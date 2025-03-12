import { ReservationProgressBar } from '@/components/reservation-progress-bar'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { useHardware } from '@/lib/hooks'
import dayjs from 'dayjs'
import { Loader2Icon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

export function ReservationScreen() {
    const { reservationId } = useParams()

    const { data: reservation, isPending } = api.getReservation.useQuery(reservationId ?? '', {
        enabled: !!reservationId,
    })

    const navigate = useNavigate()

    const { mutateAsync: deleteReservation } = api.deleteReservation.useMutation({
        onError: (error) => {
            alert(`Error al eliminar la reserva: ${error}`)
        },
        onSuccess: (deleted) => {
            if (deleted) {
                navigate('/')
            } else {
                alert('No se pude eliminar esta reserva')
            }
        },
    })

    const hard = useHardware()

    if (!reservationId) {
        return <>No hay id</>
    }

    if (isPending) {
        return (
            <div className='flex size-full items-center justify-center'>
                <Loader2Icon className='animate-spin' />
            </div>
        )
    }

    if (!reservation) {
        return <>No hay reserva</>
    }

    const hours = Math.floor((reservation.to - reservation.from) / 1000 / 60 / 60)

    function handleDelete() {
        if (!reservationId) {
            return
        }

        const confirm = window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')
        if (confirm) {
            deleteReservation(reservationId)
        }
    }

    const notebooks = hard.hardwareByReservationId.get(reservation.id) ?? []

    return (
        <section className='p-4'>
            <p>
                Pedido por: {reservation.inventoryUserName} ({reservation.inventoryUserEmail})
            </p>
            <p>Cantidad: {reservation.notebooksQuantity}</p>
            <p>Curso: {reservation.course}</p>
            <p>Lugar: {reservation.place}</p>
            <p>Notas: {reservation.notes}</p>
            <div className='max-w-[500px] py-4'>
                <p className='font-semibold'>
                    {dayjs(reservation.from).format('dddd D [de] MMMM [de] YYYY')} ({hours} horas)
                </p>
                <p className='font-semibold'>
                    de {dayjs(reservation.from).format('HH:mm')} a {dayjs(reservation.to).format('HH:mm')}
                </p>
                <ReservationProgressBar start={reservation.from} end={reservation.to} withNotebooks={notebooks.length > 0} />
            </div>
            {notebooks.length > 0 && (
                <div className='py-4'>
                    <p className='font-semibold'>Equipos en uso</p>
                    <ul>
                        {notebooks.map((notebook) => (
                            <li key={notebook.id}>
                                {notebook.asset_tag} ({notebook.manufacturer?.name} {notebook.model?.name})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {notebooks.length === 0 && (
                <Button onClick={handleDelete} variant='destructive' className='text-white'>
                    Eliminar
                </Button>
            )}
        </section>
    )
}
