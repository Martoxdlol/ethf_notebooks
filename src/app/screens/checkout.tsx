import 'react-barcode-scanner/polyfill'
import {
    ArrowDownIcon,
    ArrowRightIcon,
    DeleteIcon,
    Loader2Icon,
    XIcon,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CheckoutModal } from '@/components/checkout-modal'
import { QRScanner, useBarcodeEvent } from '@/components/qr-scanner'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { useHardware } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { Hardware } from '@/server/inventory'

const digitRegex = /^[0-9-]$/

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
            return (
                (asset.asset_tag.includes(keypad) ||
                    asset.asset_tag.replace(/-/gi, '').includes(keypad)) &&
                !selected.has(asset.asset_tag)
            )
        })
    }, [hard, keypad, selected])

    const [selectedResult, setSelectedResult] = useState(0)

    useBarcodeEvent((value) => {
        addToSelected(value)
    })

    useEffect(() => {
        if (selectedResult >= searchResults.length) {
            setSelectedResult(Math.max(0, searchResults.length - 1))
        }
    }, [searchResults, selectedResult])

    useLayoutEffect(() => {
        const element = document.getElementById(
            `search-result-${selectedResult}`,
        )
        if (element) {
            element.scrollIntoView({
                block: 'nearest',
            })
        }
    }, [selectedResult])

    useEffect(() => {
        const controller = new AbortController()

        window.addEventListener(
            'keydown',
            (event) => {
                // detect 1-9, arrow left and right, enter, backspace
                if (event.key.match(digitRegex)) {
                    if (event.shiftKey || event.ctrlKey) {
                        const tag =
                            searchResults[Number.parseInt(event.key, 10)]
                                ?.asset_tag
                        if (tag) {
                            addToSelected(tag)
                        }
                        setKeypad('')
                    } else {
                        keypadAppend(event.key)
                    }
                    event.preventDefault()
                } else if (event.key === 'Backspace') {
                    keypadBackspace()
                    event.preventDefault()
                } else if (event.key === 'Enter') {
                    const tag = searchResults[selectedResult]?.asset_tag
                    if (tag) {
                        addToSelected(tag)
                    }
                    setKeypad('')
                    event.preventDefault()
                } else if (event.key === ' ') {
                    const tag = searchResults[selectedResult]?.asset_tag
                    if (tag) {
                        addToSelected(tag)
                    }
                    event.preventDefault()
                } else if (event.key === 'ArrowLeft') {
                    setSelectedResult((prev) => Math.max(-1, prev - 1))
                    event.preventDefault()
                } else if (event.key === 'ArrowRight') {
                    setSelectedResult((prev) =>
                        Math.min(searchResults.length - 1, prev + 1),
                    )
                    event.preventDefault()
                }
            },
            { signal: controller.signal },
        )

        return () => {
            controller.abort()
        }
    })

    const { mutateAsync: checkinAssets } = api.checkinAssets.useMutation({
        onSuccess: () => {
            setSelected(new Map())
            hard.refetch()
        },
    })

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <div className='min-h-0 grow overflow-auto'>
                {hard.isPending && (
                    <Loader2Icon className='m-auto mt-10 animate-spin' />
                )}

                <div className='grid h-fit w-full grid-cols-1 whitespace-nowrap lg:grid-cols-2 xl:grid-cols-3'>
                    {Array.from(selected.values()).map((asset) => (
                        <div key={asset.id} className='flex gap-4 border-b p-4'>
                            <p className='shrink-0'>{asset.asset_tag}</p>
                            <p className='min-h-0 overflow-hidden text-ellipsis'>
                                {asset.model.name}
                            </p>
                            <p className='min-h-0 shrink grow overflow-hidden text-ellipsis'>
                                {asset.assigned_to?.name}
                            </p>
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
                </div>

                {selected.size === 0 && !hard.isPending && (
                    <div className='flex size-full h-full flex-col items-center justify-center'>
                        <p className='text-xl'>
                            No hay notebooks seleccionadas
                        </p>
                        <p className='text-sm'>
                            Escanea el QR o ingrese con el teclado
                        </p>
                    </div>
                )}
            </div>
            <div
                className='flex h-18 shrink-0 flex-col relative'
                style={{
                    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
                }}
            >
                {keypad ? (
                    <>
                        <p className='text-center text-xs'>{keypad}...</p>
                        {searchResults.length === 0 && (
                            <p className='text-sm italic'>Sin resultados...</p>
                        )}
                        <div className='flex w-full grow flex-nowrap gap-2 overflow-x-auto p-2 pt-0.5'>
                            {searchResults.map((asset, i) => (
                                <button
                                    id={`search-result-${i}`}
                                    key={asset.id}
                                    className={cn(
                                        'h-full shrink-0 rounded-md border px-2 shadow',
                                        {
                                            'outline outline-blue-500':
                                                i === selectedResult,
                                            'focus:outline-none':
                                                i !== selectedResult,
                                        },
                                    )}
                                    onClick={() => {
                                        addToSelected(asset.asset_tag)
                                        setKeypad('')
                                    }}
                                >
                                    {asset.asset_tag}
                                </button>
                            ))}
                        </div>
                        <button
                            className='absolute right-1 top-0 bottom-0 z-10'
                            onClick={keypadClear}
                        >
                            <XIcon />
                        </button>
                    </>
                ) : (
                    <div className='flex size-full items-center gap-2 px-2'>
                        <div className='grow'>
                            <p>{selected.size} Seleccionadas</p>
                            <Link
                                to='/notebooks'
                                className='text-blue-500 underline'
                            >
                                Ver todas
                            </Link>
                        </div>
                        <div className='flex gap-2'>
                            <button onClick={() => setSelected(new Map())}>
                                <XIcon />
                            </button>
                            <Button
                                variant='outline'
                                disabled={selected.size === 0}
                                onClick={() =>
                                    checkinAssets({
                                        assetTags: Array.from(selected.keys()),
                                    })
                                }
                            >
                                <ArrowDownIcon />
                                Recibir
                            </Button>
                            <CheckoutModal
                                assets={Array.from(selected.keys())}
                                onConfirmed={() => {
                                    setSelected(new Map())
                                    hard.refetch()
                                }}
                            >
                                <Button disabled={selected.size === 0}>
                                    Entregar <ArrowRightIcon />
                                </Button>
                            </CheckoutModal>
                        </div>
                    </div>
                )}
            </div>
            <div className='flex h-[250px] shrink-0'>
                <QRScanner height='250px' width='140px' />
                <div className='min-w-0 shrink grow'>
                    <div className='grid size-full grid-cols-3 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border-t [&>button]:border-r [&>button]:p-4'>
                        {Array.from({ length: 9 }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => keypadAppend(String(i + 1))}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => keypadAppend('-')}>-</button>
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
