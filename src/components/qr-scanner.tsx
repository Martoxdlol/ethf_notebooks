import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'
import { memo, useEffect } from 'react'
import { BarcodeScanner, type DetectedBarcode } from 'react-barcode-scanner'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from './ui/button'

export const QRScanner = memo(QRScannerNoMemo)

function QRScannerNoMemo(props: { width?: string; height?: string }) {
    return (
        <div
            style={{
                width: props.width ?? '100%',
                height: props.height ?? '360px',
                overflow: 'hidden',
            }}
        >
            <ErrorBoundary
                fallbackRender={({ error }) => (
                    <div className='relative flex size-full flex-col items-center justify-center gap-4 border-t border-r'>
                        <p className='text-xs'>Error de scanner</p>
                        <TriangleAlertIcon color='red' />
                        <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => window.location.reload()}
                        >
                            <RotateCcwIcon />
                        </Button>
                        <p
                            className='absolute bottom-0 font-mono text-xs opacity-50'
                            onClick={() => alert(error.message)}
                        >
                            Error: {error.message}
                        </p>
                    </div>
                )}
            >
                <BarcodeScanner
                    options={{
                        // qr code
                        formats: ['qr_code'],
                        delay: 500,
                    }}
                    onCapture={(codes) => {
                        for (const barcode of codes) {
                            const myEvent = new CustomEvent('barcode-scanned', {
                                detail: {
                                    message: barcode.rawValue,
                                    data: barcode,
                                },
                                bubbles: false, // Optional:  Allows the event to bubble up the DOM tree
                                cancelable: false, // Optional:  Allows the event to be cancelled (preventDefault())
                            })

                            window.dispatchEvent(myEvent)
                        }
                    }}
                />
            </ErrorBoundary>
        </div>
    )
}

export function useBarcodeEvent(
    callback: (value: string, barcode: DetectedBarcode) => void,
    deps?: unknown[],
) {
    return useEffect(() => {
        const controller = new AbortController()

        window.addEventListener(
            'barcode-scanned',
            (e) => {
                const { message, data } = (
                    e as CustomEvent<{ message: string; data: DetectedBarcode }>
                ).detail
                callback(message, data)
            },
            { signal: controller.signal },
        )

        return () => {
            controller.abort()
        }
    }, [callback, ...(deps ?? [])])
}
