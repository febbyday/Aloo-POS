import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Product = {
  id: string
  name: string
  sku: string
  variants: ProductVariant[]
}

type ProductVariant = {
  id: string
  size: string
  color: string
  stock: number
  price: number
}

type ProductSearchProps = {
  products: Product[]
  onSelect: (product: Product, variant: ProductVariant) => void
}

export function ProductSearch({ products, onSelect }: ProductSearchProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? products.find((product) => 
                product.variants.some(v => v.id === value)
              )?.name
            : "Search products..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandEmpty>No products found.</CommandEmpty>
          {products.map((product) => (
            <CommandGroup key={product.id} heading={product.name}>
              {product.variants.map((variant) => (
                <CommandItem
                  key={variant.id}
                  value={variant.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                    onSelect(product, variant)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === variant.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <div>{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {variant.size} / {variant.color} - Stock: {variant.stock}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
