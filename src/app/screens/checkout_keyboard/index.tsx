import { XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useHardware } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { Hardware } from '@/server/inventory'
import useDivSize from './use-div-size'
import { useKeyboardInputEvents } from './use-keyboard-checkout'
import useTimeout from './use-timeout'

type SelectedHardware = {
    hard: Hardware
    addedAt: number
}

const OVERLAY_TIMEOUT = 15_000

export function CheckoutScreenKeyboard() {
    const hard = useHardware()

    const [selectedComputers, setSelectedComputers] = useState<
        Map<string, SelectedHardware>
    >(new Map())

    const [lastAdded, setLastAdded] = useState<SelectedHardware | null>(null)

    const overlayRef = useRef<HTMLDivElement>(null)

    const { activeMode, defaultInput, modeInputs } = useKeyboardInputEvents({
        onModeSubmit(mode, text) {
            console.log(mode, text)
        },
        onSubmit(text) {
            const match = hard.findBestMatch(text)
            if (match) {
                setLastAdded({ hard: match, addedAt: Date.now() })
                setSelectedComputers((prev) => {
                    const newMap = new Map(prev)

                    newMap.set(match.asset_tag, {
                        hard: match,
                        addedAt: Date.now(),
                    })
                    return newMap
                })
            }
        },
        preventDefault: true,
    })

    useTimeout({
        timestamp: lastAdded ? lastAdded.addedAt + OVERLAY_TIMEOUT : 0,

        onStart: (timeout) => {
            overlayRef.current?.animate(
                [
                    {
                        opacity: 1,
                    },
                    {
                        opacity: 0,
                    },
                ],
                {
                    duration: timeout,
                    fill: 'forwards',
                },
            )
        },
        onTimeout() {
            setLastAdded(null)
        },
    })

    const [size, ref] = useDivSize()

    const cols = Math.max(1, Math.floor(size.width / 200))

    return (
        <div className='relative size-full'>
            {lastAdded && (
                <div
                    className='fixed pointer-events-none flex items-center justify-center left-0 right-0 bottom-0 top-0'
                    ref={overlayRef}
                >
                    <div className='min-w-[300px] px-4 h-[150px] text-white opacity-75 bg-black shadow-md text-4xl font-semibold flex items-center justify-center'>
                        <span>{lastAdded.hard.asset_tag}</span>
                    </div>
                </div>
            )}
            {defaultInput && (
                <div className='fixed pointer-events-none bottom-0 h-16 left-0 right-0 flex justify-center items-center'>
                    <div className='px-6 py-3 rounded-md shadow-sm bg-black opacity-60 text-xl text-white'>
                        {defaultInput}
                    </div>
                </div>
            )}
            <div className='flex flex-col size-full'>
                <div className='flex shrink min-h-0 grow'>
                    <div
                        className='grid flex-1 min-w-0 shrink gap-2 p-2 auto-rows-min'
                        ref={ref}
                        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                    >
                        {Array.from(selectedComputers.values()).map((item) => (
                            <HardwareRectangle
                                onRemove={() => {
                                    setSelectedComputers((prev) => {
                                        const newMap = new Map(prev)
                                        newMap.delete(item.hard.asset_tag)
                                        return newMap
                                    })
                                }}
                                key={item.hard.asset_tag}
                                hard={item.hard}
                                addedAt={item.addedAt}
                            />
                        ))}
                    </div>
                    <div className='flex flex-col flex-1 min-w-0 shrink'>2</div>
                </div>
                <div className='shrink-0 h-10 flex items-center bg-gray-100 gap-2 px-2'>
                    <KeyBadge
                        keyName='num pad | scanner'
                        text='Buscar hardware'
                    />
                    <KeyBadge
                        keyName='ctrl + [num]'
                        text='Selecionar usuario'
                    />
                </div>
            </div>
        </div>
    )
}

function KeyBadge(props: { keyName: string; text: string }) {
    return (
        <div className='flex items-center border rounded-lg p-0.5 gap-2 pr-2 bg-white'>
            <div className='px-2 py-0.5 text-sm rounded-md bg-black text-white'>
                {props.keyName}
            </div>
            <div className='text-sm'>{props.text}</div>
        </div>
    )
}

const FADE_TIMEOUT = 1_000

function HardwareRectangle(props: {
    hard: Hardware
    addedAt: number
    onRemove?: () => void
}) {
    const divRef = useRef<HTMLDivElement>(null)

    useTimeout({
        timestamp: props.addedAt + FADE_TIMEOUT,

        onStart: (timeout) =>
            divRef.current?.animate(
                [
                    {
                        backgroundColor: 'transparent',
                        transform: 'scale(1)',
                        color: 'white',
                    },
                    { backgroundColor: 'black', transform: 'scale(1.3)' },
                    { transform: 'scale(1.2)' },
                    { transform: 'scale(1.1)' },
                    {
                        backgroundColor: '#DBEAFE',
                        transform: 'scale(1.0)',
                        color: 'black',
                    },
                ],
                {
                    duration: timeout,
                    fill: 'forwards',
                },
            ),
    })

    return (
        <div
            className='bg-blue-100 rounded-md shadow-sm p-4 relative'
            ref={divRef}
        >
            <Button
                className='absolute top-1 right-1'
                variant='ghost'
                onClick={props.onRemove}
            >
                <XIcon />
            </Button>
            <h3 className='text-lg font-bold'>{props.hard.asset_tag}</h3>
            {props.hard.assigned_to && <p>{props.hard.assigned_to.name}</p>}
            {!props.hard.assigned_to && (
                <p className='text-black/40'>sin asignar</p>
            )}
        </div>
    )
}
