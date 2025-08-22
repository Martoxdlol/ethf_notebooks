import { useState } from 'react'
import { api } from '@/lib/api-client'
import { decodeTime, encodeTime, type Time } from '@/lib/constants'
import { DiscreteTimeSelect } from './discrete-time-select'
import { InventoryUserPicker } from './inventory-user-picker'
import { ReservationPicker } from './reservation-picker'
import { Button } from './ui/button'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from './ui/drawer'

export function CheckoutModal(props: {
    children: React.ReactNode
    assets: string[]
    onConfirmed: () => void
}) {
    const [userId, setUserId] = useState<number>()
    const [from, setFrom] = useState<Time>()
    const [to, setTo] = useState<Time>()
    const [reservationId, setReservationId] = useState<string>()

    const { mutateAsync: checkout } = api.checkoutAssets.useMutation()

    const isValid = (userId && from && to) || reservationId

    function handleConfirm() {
        if (!(userId && from && to)) {
            return
        }

        checkout({
            inventoryUserId: userId,
            assetTags: props.assets,
            reservationId: reservationId ?? null,
            from: from ?? null,
            to: to ?? null,
        }).then(() => {
            document.getElementById('close-drawer')?.click()
            props.onConfirmed()
        })
    }

    return (
        <Drawer>
            <DrawerTrigger asChild={true}>{props.children}</DrawerTrigger>
            <DrawerContent className='mx-auto max-w-[600px]'>
                <DrawerHeader>
                    <DrawerTitle>Entregar notebooks</DrawerTitle>
                    {/* <DrawerDescription></DrawerDescription> */}
                </DrawerHeader>
                <div className='flex flex-col gap-2 px-4'>
                    <InventoryUserPicker
                        onChange={setUserId}
                        value={userId}
                        noDefault={true}
                    />
                    <ReservationPicker
                        onChange={(value) => {
                            setReservationId(value)
                        }}
                        value={reservationId}
                        inventoryUserId={userId}
                    />
                    {!reservationId && (
                        <>
                            <p className='font-semibold text-xs'>
                                Nueva reserva (o elegir una existente ⬆️)
                            </p>
                            <div className='flex items-center gap-2'>
                                <DiscreteTimeSelect
                                    onChange={(value) => {
                                        setFrom(
                                            value
                                                ? decodeTime(value)
                                                : undefined,
                                        )
                                    }}
                                    value={from ? encodeTime(from) : undefined}
                                    placeholder='Desde'
                                    maxExclusive={
                                        to ? encodeTime(to) : undefined
                                    }
                                />
                                <DiscreteTimeSelect
                                    minInclusive={
                                        from ? encodeTime(from) : undefined
                                    }
                                    onChange={(value) => {
                                        setTo(
                                            value
                                                ? decodeTime(value)
                                                : undefined,
                                        )
                                    }}
                                    value={to ? encodeTime(to) : undefined}
                                    placeholder='Hasta'
                                />
                            </div>
                        </>
                    )}
                </div>
                <DrawerFooter>
                    <Button onClick={handleConfirm} disabled={!isValid}>
                        Confirmar
                    </Button>
                    <DrawerClose asChild={true}>
                        <Button variant='outline' id='close-drawer'>
                            Cancelar
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
