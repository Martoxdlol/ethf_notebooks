import { useHardware } from '@/lib/hooks'

const _digitRegex = /^[0-9-]$/

export function CheckoutScreenKeyboard() {
    const _hard = useHardware()

    return (
        <div className='flex' ref={divRef}>
            <div className='flex flex-col flex-1 min-w-0 shrink'>1</div>
            <div className='flex flex-col flex-1 min-w-0 shrink'>2</div>
        </div>
    )
}
