import { useParams } from 'react-router'

export function ReservationScreen() {
    const { reservationId } = useParams()

    return <>{reservationId}</>
}
