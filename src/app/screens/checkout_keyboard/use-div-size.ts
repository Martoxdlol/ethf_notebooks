import { useCallback, useEffect, useRef, useState } from 'react'

interface DivSize {
    width: number
    height: number
}

type DivRef = (node: HTMLDivElement | null) => void

function useDivSize(): [DivSize, DivRef] {
    const [size, setSize] = useState<DivSize>({ width: 0, height: 0 })
    const divRef = useRef<HTMLDivElement | null>(null)
    const observerRef = useRef<ResizeObserver | null>(null)

    const updateSize = useCallback(() => {
        if (divRef.current) {
            const { width, height } = divRef.current.getBoundingClientRect()
            setSize({ width, height })
        }
    }, [])

    const setRef: DivRef = useCallback(
        (node) => {
            // Disconnect the previous observer if the ref changes
            if (observerRef.current) {
                observerRef.current.disconnect()
            }

            divRef.current = node

            if (node) {
                // Initialize size immediately
                updateSize()

                // Create a new ResizeObserver for the current node
                observerRef.current = new ResizeObserver(updateSize)
                observerRef.current.observe(node)
            }
        },
        [updateSize],
    )

    // Clean up observer when the component unmounts
    useEffect(() => {
        const currentObserver = observerRef.current
        return () => {
            if (currentObserver) {
                currentObserver.disconnect()
            }
        }
    }, [])

    return [size, setRef]
}

export default useDivSize
