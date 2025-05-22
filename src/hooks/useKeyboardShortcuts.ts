import { useEffect, useCallback, useState } from 'react'

export type ShortcutAction = 
  | 'checkout'
  | 'search'
  | 'newTransaction'
  | 'cancelTransaction'
  | 'applyDiscount'
  | 'quickPay'
  | 'addCustomer'
  | 'holdTransaction'
  | 'retrieveHold'
  | 'toggleCategories'
  | 'navigateNext'
  | 'navigatePrevious'
  | 'help'

export interface ShortcutDefinition {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
  action: ShortcutAction
}

export interface KeyboardShortcutsOptions {
  /**
   * Whether keyboard shortcuts are enabled
   * @default true
   */
  enabled?: boolean
  
  /**
   * Custom shortcut definitions to override defaults
   */
  customShortcuts?: ShortcutDefinition[]
  
  /**
   * Callback fired when a shortcut is triggered
   */
  onShortcut?: (action: ShortcutAction, event: KeyboardEvent) => void
  
  /**
   * Whether to prevent default browser behavior when a shortcut is triggered
   * @default true
   */
  preventDefault?: boolean
  
  /**
   * Whether to stop event propagation when a shortcut is triggered
   * @default true
   */
  stopPropagation?: boolean
}

// Default keyboard shortcuts for the POS system
const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  {
    key: 'p',
    ctrlKey: true,
    description: 'Process payment / checkout',
    action: 'checkout'
  },
  {
    key: 'f',
    ctrlKey: true,
    description: 'Search products',
    action: 'search'
  },
  {
    key: 'n',
    ctrlKey: true,
    description: 'New transaction',
    action: 'newTransaction'
  },
  {
    key: 'x',
    ctrlKey: true,
    description: 'Cancel current transaction',
    action: 'cancelTransaction'
  },
  {
    key: 'd',
    ctrlKey: true,
    description: 'Apply discount',
    action: 'applyDiscount'
  },
  {
    key: 'q',
    ctrlKey: true,
    description: 'Quick pay (cash)',
    action: 'quickPay'
  },
  {
    key: 'c',
    ctrlKey: true,
    description: 'Add/select customer',
    action: 'addCustomer'
  },
  {
    key: 'h',
    ctrlKey: true,
    description: 'Hold transaction',
    action: 'holdTransaction'
  },
  {
    key: 'r',
    ctrlKey: true,
    description: 'Retrieve held transaction',
    action: 'retrieveHold'
  },
  {
    key: 'Tab',
    description: 'Toggle product categories',
    action: 'toggleCategories'
  },
  {
    key: 'ArrowRight',
    description: 'Navigate to next item',
    action: 'navigateNext'
  },
  {
    key: 'ArrowLeft',
    description: 'Navigate to previous item',
    action: 'navigatePrevious'
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts help',
    action: 'help'
  }
]

/**
 * Hook for handling keyboard shortcuts in the POS system
 */
export const useKeyboardShortcuts = ({
  enabled = true,
  customShortcuts = [],
  onShortcut,
  preventDefault = true,
  stopPropagation = true
}: KeyboardShortcutsOptions = {}) => {
  // Combine default shortcuts with custom shortcuts, with custom taking precedence
  const [shortcuts, setShortcuts] = useState<ShortcutDefinition[]>(() => {
    const shortcutMap = new Map<ShortcutAction, ShortcutDefinition>()
    
    // Add defaults first
    DEFAULT_SHORTCUTS.forEach(shortcut => {
      shortcutMap.set(shortcut.action, shortcut)
    })
    
    // Override with customs
    customShortcuts.forEach(shortcut => {
      shortcutMap.set(shortcut.action, shortcut)
    })
    
    return Array.from(shortcutMap.values())
  })
  
  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return
    
    // Skip if user is typing in an input, textarea, or select
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return
    }
    
    // Find matching shortcut
    const matchedShortcut = shortcuts.find(shortcut => {
      const keyMatches = event.key === shortcut.key
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const altMatches = !!shortcut.altKey === event.altKey
      
      return keyMatches && ctrlMatches && shiftMatches && altMatches
    })
    
    if (matchedShortcut) {
      if (preventDefault) {
        event.preventDefault()
      }
      
      if (stopPropagation) {
        event.stopPropagation()
      }
      
      // Call the onShortcut callback if provided
      if (onShortcut) {
        onShortcut(matchedShortcut.action, event)
      }
      
      // Return the matched action for convenience
      return matchedShortcut.action
    }
    
    return null
  }, [enabled, shortcuts, onShortcut, preventDefault, stopPropagation])
  
  // Set up and clean up the event listener
  useEffect(() => {
    if (!enabled) return
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
  
  // Update shortcuts if customShortcuts changes
  useEffect(() => {
    const shortcutMap = new Map<ShortcutAction, ShortcutDefinition>()
    
    // Add defaults first
    DEFAULT_SHORTCUTS.forEach(shortcut => {
      shortcutMap.set(shortcut.action, shortcut)
    })
    
    // Override with customs
    customShortcuts.forEach(shortcut => {
      shortcutMap.set(shortcut.action, shortcut)
    })
    
    setShortcuts(Array.from(shortcutMap.values()))
  }, [customShortcuts])
  
  // Return the shortcuts and a way to check if a specific shortcut is active
  return {
    shortcuts,
    isEnabled: enabled,
    /**
     * Get the keyboard shortcut for a specific action
     */
    getShortcutForAction: (action: ShortcutAction): ShortcutDefinition | undefined => {
      return shortcuts.find(s => s.action === action)
    },
    /**
     * Format a shortcut for display (e.g., "Ctrl+P")
     */
    formatShortcut: (shortcut: ShortcutDefinition): string => {
      const parts: string[] = []
      
      if (shortcut.ctrlKey) parts.push('Ctrl')
      if (shortcut.altKey) parts.push('Alt')
      if (shortcut.shiftKey) parts.push('Shift')
      
      // Format the key for display
      let key = shortcut.key
      if (key === ' ') key = 'Space'
      else if (key.length === 1) key = key.toUpperCase()
      
      parts.push(key)
      
      return parts.join('+')
    }
  }
}

export default useKeyboardShortcuts
