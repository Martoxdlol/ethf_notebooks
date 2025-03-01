import 'react-barcode-scanner/polyfill'
import { QRScanner, useBarcodeEvent } from '@/components/qr-scanner'
import { useHardware } from '@/lib/hooks'
import type { Hardware } from '@/server/inventory'
import { useState } from 'react'

export function CheckoutScreen() {
    const hard = useHardware()

    const [scanned, setScanned] = useState<Set<Hardware>>(new Set())
    const [mode, setMode] = useState<'add' | 'remove'>('add')

    useBarcodeEvent(
        (value) => {
            const asset = hard.hardwareByAssetTag.get(value)
            if (!asset) {
                return
            }

            console.info('Scanned:', asset.asset_tag, asset.model.name)

            setScanned((prev) => {
                const next = new Set(prev)
                if (mode === 'add') {
                    next.add(asset)
                } else {
                    next.delete(asset)
                }
                return next
            })
        },
        [hard],
    )

    return (
        <>
            <QRScanner height='300px' />
            {hard.isPending && <p>Cargando...</p>}
            {hard.error && <p>Error: {hard.error.message}</p>}
            <h1>Seleccionados</h1>
            <ul>
                {[...scanned].map((h) => (
                    <li key={h.asset_tag}>
                        {h.asset_tag} - {h.model.name}
                    </li>
                ))}
            </ul>
            <aside className='bottom-0 sticky'>Siguiente</aside>
        </>
    )
}
