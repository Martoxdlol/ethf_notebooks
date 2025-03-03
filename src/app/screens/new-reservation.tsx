import { DatePicker } from '@/components/date-picker'
import { DiscreteTimeSelect } from '@/components/discrete-time-select'
import { InventoryUserPicker } from '@/components/inventory-user-picker'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api-client'
import { type Time, decodeTime, encodeTime } from '@/lib/constants'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { createId } from 'm3-stack/helpers'
import { useState } from 'react'
import { useNavigate } from 'react-router'

export function NewReservationScreen() {
    const [qty, setQty] = useState(1)
    const [inventoryUserId, setInventoryUserId] = useState<number>()
    const [date, setDate] = useState<Date>()
    const [from, setFrom] = useState<Time>()
    const [to, setTo] = useState<Time>()
    const [course, setCourse] = useState('')
    const [place, setPlace] = useState('')
    const [notes, setNotes] = useState('')

    const [idempotencyKey] = useState(createId(40))

    const navigate = useNavigate()

    function setQtySafe(value: number) {
        if (value < 1) {
            setQty(1)
        } else if (value > 100) {
            setQty(100)
        } else {
            setQty(value)
        }
    }

    function addOne() {
        setQtySafe(qty + 1)
    }

    function removeOne() {
        setQtySafe(qty - 1)
    }

    const isValid = date && from && to && course && place && qty > 0

    const { mutateAsync: createReservation, isPending, error, reset } = api.createReservation.useMutation()

    function handleSubmit() {
        if (!(date && from && to && course && place && qty > 0)) {
            return
        }

        createReservation({
            inventoryUserId: inventoryUserId ?? null,
            course,
            date: {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
            },
            from,
            to,
            notes,
            notebooksQuantity: qty,
            place,
            idempotencyKey,
        }).then((r) => {
            navigate(`/reservas/${r.id}`)
        })
    }

    return (
        <>
            <AlertDialog open={!!error}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>No se pudo crear la reserva</AlertDialogTitle>
                        <AlertDialogDescription>{error?.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => reset()}>Cerrar</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <form
                className='p-4'
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit()
                }}
            >
                <div className='mx-auto flex max-w-[600px] flex-col gap-4'>
                    <section>
                        <h1 className='mb-1'>Nueva reserva</h1>
                        <Card className='flex flex-col gap-4 p-4'>
                            <div className='flex items-center gap-4'>
                                <input
                                    value={qty}
                                    onChange={(e) => setQtySafe(Number.parseInt(e.target.value))}
                                    type='number'
                                    className='h-12 w-16 rounded-none border-b-2 bg-primary/5 text-center text-lg'
                                    style={{
                                        appearance: 'textfield',
                                        MozAppearance: 'textfield',
                                        WebkitAppearance: 'textfield',
                                    }}
                                />
                                <div className='grow'>
                                    <p>Notebooks</p>
                                </div>
                                <div className='flex'>
                                    <Button size='icon' variant='ghost' onClick={removeOne} type='button'>
                                        <MinusIcon />
                                    </Button>
                                    <Button size='icon' variant='ghost' onClick={addOne} type='button'>
                                        <PlusIcon />
                                    </Button>
                                </div>
                            </div>
                            <Slider value={[qty]} max={100} step={1} onValueChange={(values) => setQtySafe(values[0]!)} />
                        </Card>
                    </section>
                    <section>
                        <h2 className='mb-1'>Para quien</h2>
                        <InventoryUserPicker
                            onChange={(value) => {
                                setInventoryUserId(value)
                            }}
                            value={inventoryUserId}
                        />
                    </section>

                    <section>
                        <h2 className='mb-1'>Curso y lugar</h2>
                        <div className='grid grid-cols-2 gap-2'>
                            <Input
                                list='courses'
                                placeholder='Curso'
                                required={true}
                                onChange={(e) => setCourse(e.target.value)}
                                value={course}
                            />
                            <datalist id='courses'>
                                <option value='1°' />
                                <option value='2°' />
                                <option value='3°' />
                                <option value='4°' />
                                <option value='5°' />
                                <option value='6°' />
                                <option value='7°' />
                            </datalist>
                            <Input
                                list='places'
                                placeholder='Lugar'
                                required={true}
                                onChange={(e) => setPlace(e.target.value)}
                                value={place}
                            />
                            <datalist id='places'>
                                <option value='Auditorio' />
                                <option value='Aula 1' />
                                <option value='Aula 2' />
                                <option value='Aula 3' />
                                <option value='Aula 4' />
                                <option value='Aula 5' />
                                <option value='Aula 6' />
                                <option value='Informática' />
                                <option value='Laboratorio' />
                                <option value='Taller' />
                                <option value='Metales' />
                                <option value='Robótica' />
                                <option value='Metrología' />
                                <option value='Motores' />
                            </datalist>
                        </div>
                    </section>
                    <section>
                        <h2 className='mb-1'>Fecha</h2>
                        <DatePicker onChange={(value) => setDate(value)} value={date} placeholder='Seleccionar fecha' />
                    </section>
                    <section>
                        <h2 className='mb-1'>Horario</h2>
                        <div className='grid grid-cols-2 gap-2'>
                            <DiscreteTimeSelect
                                onChange={(value) => {
                                    setFrom(value ? decodeTime(value) : undefined)
                                }}
                                value={from ? encodeTime(from) : undefined}
                                placeholder='Desde'
                                maxExclusive={to ? encodeTime(to) : undefined}
                            />
                            <DiscreteTimeSelect
                                minInclusive={from ? encodeTime(from) : undefined}
                                onChange={(value) => {
                                    setTo(value ? decodeTime(value) : undefined)
                                }}
                                value={to ? encodeTime(to) : undefined}
                                placeholder='Hasta'
                            />
                        </div>
                    </section>
                    <section>
                        <h2 className='mb-1'>Notas y comentarios</h2>
                        <Card>
                            <Textarea
                                placeholder='Notas'
                                className='h-40 resize-none'
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </Card>
                    </section>
                    <Button type='submit' className='h-12 w-full' disabled={!isValid || isPending}>
                        Confirmar
                    </Button>
                </div>
            </form>
        </>
    )
}
