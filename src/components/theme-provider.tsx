import { createContext, useContext, useEffect, useState } from "react"
import SettingsService, { themeService } from "@/features/settings/services/theme.service"

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
  storageKey = "vite-ui-theme", // This is kept for backward compatibility but not used
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark")
  const [isInitialized, setIsInitialized] = useState(false)

  // Load theme from settings service
  useEffect(() => {
    try {
      const loadTheme = async () => {
        try {
          const settings = await SettingsService.getSettings();
          setThemeState(settings.theme as Theme);
          setIsInitialized(true);
        } catch (error) {
          console.error("Error loading theme settings:", error);
          // Fall back to default theme
          setIsInitialized(true);
        }
      };

      loadTheme();
    } catch (error) {
      console.error("Error loading theme settings:", error);
      // Fall back to default theme
      setIsInitialized(true);
    }
  }, [])

  // Function to get system preference
  const getSystemTheme = (): "dark" | "light" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  // Apply theme to document
  useEffect(() => {
    try {
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
        try {
          root.classList.remove("no-theme-transition")
        } catch (error) {
          console.error("Error re-enabling theme transitions:", error)
        }
      }, 0)
    } catch (error) {
      console.error("Error applying theme:", error)
      // Fallback to default theme silently
      setResolvedTheme(theme === "system" ? getSystemTheme() : theme)
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      const handleChange = () => {
        try {
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
              try {
                root.classList.remove("no-theme-transition")
              } catch (error) {
                console.error("Error re-enabling theme transitions in media query handler:", error)
              }
            }, 0)
          }
        } catch (error) {
          console.error("Error in system theme change handler:", error)
        }
      }

      try {
        mediaQuery.addEventListener("change", handleChange)
        return () => {
          try {
            mediaQuery.removeEventListener("change", handleChange)
          } catch (error) {
            console.error("Error removing media query event listener:", error)
          }
        }
      } catch (error) {
        console.error("Error adding media query event listener:", error)
        return () => {/* Empty cleanup function */}
      }
    } catch (error) {
      console.error("Error setting up system theme change detection:", error)
      return () => {/* Empty cleanup function */}
    }
  }, [theme])

  // Function to update theme
  const setTheme = async (newTheme: Theme) => {
    try {
      // Update theme in settings service
      const settings = await SettingsService.getSettings();
      await SettingsService.saveSettings({
        ...settings,
        theme: newTheme
      });

      // Update local state
      setThemeState(newTheme);
    } catch (error) {
      console.error("Error saving theme settings:", error);
      // Still update local state even if saving fails
      setThemeState(newTheme);
    }
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme,
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
