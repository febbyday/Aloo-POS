import { createContext, useContext, useState, ReactNode } from "react"
import { Store } from "../components/StoreSelect"

interface StoreContextType {
  currentStore: Store | null
  setCurrentStore: (store: Store) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null)

  return (
    <StoreContext.Provider value={{ currentStore, setCurrentStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
