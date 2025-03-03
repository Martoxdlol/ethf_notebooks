import 'react-barcode-scanner/polyfill'
import { QRScanner } from '@/components/qr-scanner'
import { Button } from '@/components/ui/button'
import { useHardware } from '@/lib/hooks'
import type { Hardware } from '@/server/inventory'
import { ArrowDownIcon, ArrowRightIcon, DeleteIcon, Loader2Icon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

export function CheckoutScreen() {
    const hard = useHardware()

    const [selected, setSelected] = useState<Map<string, Hardware>>(new Map())

    const [keypad, setKeypad] = useState<string>('')

    function keypadAppend(value: string) {
        setKeypad((prev) => prev + value)
    }

    function keypadClear() {
        setKeypad('')
    }

    function keypadBackspace() {
        setKeypad((prev) => prev.slice(0, -1))
    }

    function addToSelected(tag: string) {
        const asset = hard.hardwareByAssetTag.get(tag)
        if (!asset) {
            return
        }

        setSelected((prev) => {
            const next = new Map(prev)
            next.set(tag, asset)
            return next
        })
    }

    const searchResults = useMemo(() => {
        if (!keypad) {
            return []
        }

        return Array.from(hard.hardwareByAssetTag.values()).filter((asset) => {
            return asset.asset_tag.includes(keypad) && !selected.has(asset.asset_tag)
        })
    }, [hard, keypad])

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <div className='min-h-0 grow overflow-auto'>
                {hard.isPending && <Loader2Icon className='m-auto mt-10 animate-spin' />}

                {Array.from(selected.values()).map((asset) => (
                    <div key={asset.id} className='flex gap-4 border-b p-4'>
                        <p>{asset.asset_tag}</p>
                        <p className='grow'>{asset.model.name}</p>
                        <p className='grow'>{asset.assigned_to?.name}</p>
                        <button
                            onClick={() => {
                                setSelected((prev) => {
                                    const next = new Map(prev)
                                    next.delete(asset.asset_tag)
                                    return next
                                })
                            }}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                ))}

                {selected.size === 0 && !hard.isPending && (
                    <div className='flex size-full h-full flex-col items-center justify-center'>
                        <p className='text-xl'>No hay notebooks seleccionadas</p>
                        <p className='text-sm'>Escanea el QR o ingrese con el teclado</p>
                    </div>
                )}
            </div>
            <div
                className='flex h-20 shrink-0 flex-col'
                style={{
                    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
                }}
            >
                {keypad ? (
                    <>
                        <p className='text-xs'>Buscar: {keypad}</p>
                        {searchResults.length === 0 && <p className='text-sm italic'>Sin resultados...</p>}
                        <div className='flex w-full grow flex-nowrap gap-2 overflow-x-auto p-2'>
                            {searchResults.map((asset) => (
                                <button
                                    key={asset.id}
                                    className='h-full shrink-0 rounded-md border px-2 shadow'
                                    onClick={() => {
                                        addToSelected(asset.asset_tag)
                                        setKeypad('')
                                    }}
                                >
                                    {asset.asset_tag}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className='flex size-full items-center gap-2 px-2'>
                        <div className='grow'>
                            <p>{selected.size} Seleccionadas</p>
                            <Link to='/notebooks' className='text-blue-500 underline'>
                                Ver lista
                            </Link>
                        </div>
                        <div className='flex gap-2'>
                            <button onClick={() => setSelected(new Map())}>
                                <XIcon />
                            </button>
                            <Button variant='outline'>
                                <ArrowDownIcon />
                                Recibir
                            </Button>
                            <Button>
                                Entregar <ArrowRightIcon />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div className='flex h-[250px] shrink-0'>
                <QRScanner height='250px' width='140px' />
                <div className='min-w-0 shrink grow'>
                    <div className='grid size-full grid-cols-3 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border-t [&>button]:border-r [&>button]:p-4'>
                        {Array.from({ length: 9 }, (_, i) => (
                            <button key={i + 1} onClick={() => keypadAppend(String(i + 1))}>
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={keypadClear}>
                            <XIcon />
                        </button>
                        <button onClick={() => keypadAppend('0')}>0</button>
                        <button onClick={keypadBackspace}>
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
