import { useCallback, useEffect, useRef, useState } from 'react'

// Define the types for the callbacks
type SubmitCallback = (text: string) => void
type ModeSubmitCallback = (mode: string, text: string) => void

interface UseKeyboardInputEventsProps {
    onSubmit: SubmitCallback
    onModeSubmit: ModeSubmitCallback
    preventDefault?: boolean
}

// A helper to get a consistent identifier for modifier key combinations
function getModifierKeyCombo(event: KeyboardEvent): string | null {
    const modifiers: string[] = []
    if (event.ctrlKey) modifiers.push('ctrl')
    if (event.altKey) modifiers.push('alt')
    if (event.shiftKey) modifiers.push('shift')

    return modifiers.length > 0 ? modifiers.join('+') : null
}

/**
 * A React hook to capture text input globally based on keyboard events and
 * different input modes determined by modifier (Ctrl, Alt, Shift) and
 * function (F1-F12) keys.
 *
 * @param onSubmit - Callback for the default input (triggered by Enter).
 * @param onModeSubmit - Callback for mode-specific inputs (triggered by releasing the mode key).
 * @param preventDefault - If true, prevents default browser actions for handled keys.
 */
export function useKeyboardInputEvents({
    onSubmit,
    onModeSubmit,
    preventDefault = true,
}: UseKeyboardInputEventsProps) {
    const [defaultInput, setDefaultInput] = useState('')
    const [modeInputs, setModeInputs] = useState<Record<string, string>>({})
    const [activeMode, setActiveMode] = useState<string | null>(null)

    const callbacksRef = useRef({ onSubmit, onModeSubmit })
    useEffect(() => {
        callbacksRef.current = { onSubmit, onModeSubmit }
    }, [onSubmit, onModeSubmit])

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event

            // 1. Check for mode activation (F-keys)
            if (
                key.startsWith('F') &&
                !Number.isNaN(parseInt(key.substring(1), 10))
            ) {
                if (preventDefault) event.preventDefault()
                setActiveMode(key.toLowerCase())
                return
            }

            // 2. Check for mode activation (Modifier keys)
            const modifierCombo = getModifierKeyCombo(event)
            if (modifierCombo) {
                setActiveMode(modifierCombo)
            }

            // 3. Handle text input and actions
            const currentMode = activeMode || getModifierKeyCombo(event)

            if (key === 'Enter') {
                if (preventDefault) event.preventDefault()
                if (!currentMode && defaultInput) {
                    callbacksRef.current.onSubmit(defaultInput)
                    setDefaultInput('')
                }
                return
            }

            if (key === 'Backspace') {
                if (preventDefault) event.preventDefault()
                if (currentMode) {
                    setModeInputs((prev) => ({
                        ...prev,
                        [currentMode]: (prev[currentMode] || '').slice(0, -1),
                    }))
                } else {
                    setDefaultInput((prev) => prev.slice(0, -1))
                }
                return
            }

            // 4. Handle regular character input
            if (key.length === 1) {
                if (preventDefault) event.preventDefault()
                if (currentMode) {
                    setModeInputs((prev) => ({
                        ...prev,
                        [currentMode]: (prev[currentMode] || '') + key,
                    }))
                } else {
                    setDefaultInput((prev) => prev + key)
                }
            }
        },
        [activeMode, defaultInput, preventDefault],
    )

    const handleKeyUp = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event
            const releasedKey = key.toLowerCase()

            if (activeMode?.includes(releasedKey)) {
                const textForMode = modeInputs[activeMode]
                if (textForMode) {
                    callbacksRef.current.onModeSubmit(activeMode, textForMode)
                    setModeInputs((prev) => {
                        const next = { ...prev }
                        delete next[activeMode]
                        return next
                    })
                }
            }

            setActiveMode(null)
        },
        [activeMode, modeInputs],
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return function cleanup() {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [handleKeyDown, handleKeyUp])

    // The returned object contains the current state of the input buffers.
    return {
        defaultInput, // The current text in the default buffer
        modeInputs, // An object containing the text for all active mode buffers
        activeMode, // The identifier for the currently active mode, if any
    }
}
