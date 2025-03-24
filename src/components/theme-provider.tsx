// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "dark"
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark")

  // Function to get system preference
  const getSystemTheme = (): "dark" | "light" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove transition during theme change to avoid transition flicker
    root.classList.add("no-theme-transition")
    
    // Remove both themes
    root.classList.remove("light", "dark")

    // Apply theme based on preference
    let appliedTheme: "light" | "dark"
    if (theme === "system") {
      appliedTheme = getSystemTheme()
    } else {
      appliedTheme = theme
    }
    
    // Set the resolved theme
    setResolvedTheme(appliedTheme)
    
    // Apply theme class
    root.classList.add(appliedTheme)
    
    // Re-enable transitions after a small delay
    setTimeout(() => {
      root.classList.remove("no-theme-transition")
    }, 0)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement
        const systemTheme = getSystemTheme()
        
        // Remove transition during theme change
        root.classList.add("no-theme-transition")
        
        // Update theme
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
        
        // Update resolved theme
        setResolvedTheme(systemTheme)
        
        // Re-enable transitions after a small delay
        setTimeout(() => {
          root.classList.remove("no-theme-transition")
        }, 0)
      }
    }
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
