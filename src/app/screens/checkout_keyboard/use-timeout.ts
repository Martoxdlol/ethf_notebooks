import { useCallback, useEffect, useRef } from 'react'

/**
 * Options for the useTimeout hook.
 */
interface UseTimeoutOptions {
    /**
     * The Unix timestamp (in milliseconds) when the timeout should occur.
     * If this timestamp is in the past, the timeout will not fire.
     */
    timestamp: number | null | undefined
    /**
     * Callback function to be executed when the timeout is started (i.e.,
     * when `setTimeout` is called internally). This fires only if the
     * timestamp is in the future.
     * It receives the `remainingTime` in milliseconds until the timeout fires.
     */
    onStart?: (remainingTime: number) => void
    /**
     * Callback function to be executed when the timeout fires.
     * This fires only if the timestamp was in the future and the timeout completes.
     */
    onTimeout?: () => void
}

/**
 * A React hook that schedules a callback to be executed at a specific future timestamp.
 * If the timestamp is in the past, the timeout will not fire.
 *
 * @param options - An object containing the timestamp and optional callbacks.
 */
function useTimeout({
    timestamp,
    onStart,
    onTimeout,
}: UseTimeoutOptions): void {
    // Use a ref to store the timeout ID so we can clear it reliably.
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)

    // Memoize the onTimeout callback.
    const memoizedOnTimeout = useCallback(() => {
        if (onTimeout) {
            onTimeout()
        }
    }, [onTimeout])

    // Memoize the onStart callback. It now accepts `remainingTime`.
    const memoizedOnStart = useCallback(
        (remainingTime: number) => {
            if (onStart) {
                onStart(remainingTime)
            }
        },
        [onStart],
    )

    useEffect(() => {
        // 1. Clear any existing timeout to prevent multiple timers.
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current)
            timeoutIdRef.current = null
        }

        // 2. Validate the timestamp.
        if (timestamp === null || timestamp === undefined) {
            return // No timestamp, nothing to do.
        }

        const currentTime = Date.now()
        const delay = timestamp - currentTime // This is the 'remainingTime'

        // 3. If the timestamp is in the past or exactly now, do nothing.
        if (delay <= 0) {
            // console.log( // Uncomment for debugging
            //   `[useTimeout] Timestamp ${new Date(
            //     timestamp,
            //   ).toISOString()} is in the past (${delay}ms). Doing nothing.`,
            // );
            return
        }

        // 4. Schedule the timeout.
        memoizedOnStart(delay) // Pass the calculated 'delay' (remainingTime) to onStart
        timeoutIdRef.current = setTimeout(() => {
            memoizedOnTimeout()
            timeoutIdRef.current = null // Clear ref after execution
        }, delay)

        // 5. Cleanup function: clear the timeout if the component unmounts
        // or if the dependencies (timestamp, onTimeout, onStart) change.
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current)
                timeoutIdRef.current = null
            }
        }
    }, [timestamp, memoizedOnStart, memoizedOnTimeout]) // Dependencies for useEffect
}

export default useTimeout
