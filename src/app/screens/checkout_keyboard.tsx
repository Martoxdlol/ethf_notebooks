import { useHardware } from "@/lib/hooks"

const digitRegex = /^[0-9\-]$/

export function CheckoutScreenKeyboard() {
    const hard = useHardware()

    return <div className="flex" tabIndex={0} ref={divRef}>
        <div className="flex flex-col flex-1 min-w-0 shrink">
            1
        </div>
        <div className="flex flex-col flex-1 min-w-0 shrink">
            2
        </div>
    </div>
}

