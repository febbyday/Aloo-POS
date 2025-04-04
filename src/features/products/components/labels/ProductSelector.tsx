import { useState } from 'react'
import { Search, Filter, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useProducts } from '@/features/products/hooks/useProducts'

interface ProductSelectorProps {
  selectedProducts: string[]
  onSelect: (productIds: string[]) => void
  onQuantityChange: (productId: string, quantity: number) => void
}

export function ProductSelector({
  selectedProducts,
  onSelect,
  onQuantityChange,
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')

  const { products = [], categories = [], isLoading } = useProducts()

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || product.categoryId === categoryFilter
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && product.stock <= product.reorderPoint) ||
      (stockFilter === 'out' && product.stock === 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelect(filteredProducts.map((p) => p.id))
    } else {
      onSelect([])
    }
  }

  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      onSelect(selectedProducts.filter((id) => id !== productId))
    } else {
      onSelect([...selectedProducts, productId])
    }
  }

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value) || 0
    onQuantityChange(productId, quantity)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredProducts.length > 0 &&
                    filteredProducts.every((p) =>
                      selectedProducts.includes(p.id)
                    )
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 rounded-md object-cover"
                        />
                      )}
                      <span>{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {categories?.find((c) => c.id === product.categoryId)?.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stock === 0
                          ? 'destructive'
                          : product.stock <= product.reorderPoint
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity || ''}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      {selectedProducts.includes(product.id) ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
} 