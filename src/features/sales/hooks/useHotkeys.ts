import { useEffect, useRef } from 'react'

type HotkeyHandler = (e: KeyboardEvent) => void

interface HotkeyMap {
  [key: string]: HotkeyHandler
}

export function useHotkeys(hotkeyMap: HotkeyMap) {
  const handlers = useRef<HotkeyMap>(hotkeyMap)

  // Update handlers ref if hotkeyMap changes
  useEffect(() => {
    handlers.current = hotkeyMap
  }, [hotkeyMap])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        // Allow F-keys even in input fields
        if (!e.key.startsWith('F')) {
          return
        }
      }

      // Handle F-keys
      if (e.key.startsWith('F') && handlers.current[e.key]) {
        e.preventDefault()
        handlers.current[e.key](e)
        return
      }

      // Handle Ctrl combinations
      if (e.ctrlKey && handlers.current[`Ctrl+${e.key.toUpperCase()}`]) {
        e.preventDefault()
        handlers.current[`Ctrl+${e.key.toUpperCase()}`](e)
        return
      }

      // Handle Escape
      if (e.key === 'Escape' && handlers.current['Esc']) {
        e.preventDefault()
        handlers.current['Esc'](e)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}