import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export interface Store {
  id: string
  name: string
  address: string
  type: 'store' | 'warehouse'
}

// This would typically come from an API or configuration
const stores: Store[] = [
  {
    id: "store1",
    name: "Main Store",
    address: "123 Main St",
    type: "store"
  },
  {
    id: "store2",
    name: "Branch Store",
    address: "456 Branch Ave",
    type: "store"
  },
  {
    id: "warehouse",
    name: "Main Warehouse",
    address: "789 Warehouse Blvd",
    type: "warehouse"
  }
]

interface StoreSelectProps {
  onStoreChange?: (store: Store) => void
}

export function StoreSelect({ onStoreChange }: StoreSelectProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const { toast } = useToast()

  const handleStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (store) {
      setSelectedStore(store)
      onStoreChange?.(store)
      toast({
        title: "Store Changed",
        description: `Switched to ${store.name}`,
      })
    }
  }

  return (
    <Select onValueChange={handleStoreChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a store" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Stores</SelectLabel>
          {stores.filter(s => s.type === 'store').map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Warehouses</SelectLabel>
          {stores.filter(s => s.type === 'warehouse').map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
