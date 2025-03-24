import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Market } from "../pages/MarketsPage"
import { Card } from "@/components/ui/card"
import { 
  Package, 
  Search, 
  Filter,
  Edit,
  Trash,
  DollarSign,
  ArrowUpDown,
  BarChart2,
  Hash,
  Boxes,
  AlertCircle,
  MoreHorizontal,
  ArrowLeftRight,
  History,
  Trash2
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ManageStockDialog } from "./ManageStockDialog"

interface MarketProductsProps {
  market: Market
}

type MarketProduct = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  allocated: number
  sold: number
  performance: number
  category: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

interface ActionMenuProps {
  product: MarketProduct
}

function ActionMenu({ product }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    console.log(action, product.id)
    setIsOpen(false)
  }

  return (
    <div className="relative action-menu" onClick={(e) => e.stopPropagation()}>
      <button 
        className="p-1 rounded-md hover:bg-muted/50"
        onClick={handleClick}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-zinc-900 border border-zinc-800 shadow-lg w-48 rounded-md py-1 z-50">
          <button 
            className="block w-full px-4 py-2 text-left text-zinc-100 hover:bg-zinc-800/50"
            onClick={(e) => handleActionClick(e, 'edit')}
          >
            <span className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </span>
          </button>
          <button 
            className="block w-full px-4 py-2 text-left text-zinc-100 hover:bg-zinc-800/50"
            onClick={(e) => handleActionClick(e, 'transfer')}
          >
            <span className="flex items-center">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer
            </span>
          </button>
          <button 
            className="block w-full px-4 py-2 text-left text-zinc-100 hover:bg-zinc-800/50"
            onClick={(e) => handleActionClick(e, 'history')}
          >
            <span className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              View History
            </span>
          </button>
          <div className="border-t border-zinc-800 my-1" />
          <button 
            className="block w-full px-4 py-2 text-left text-red-500 hover:bg-zinc-800/50"
            onClick={(e) => handleActionClick(e, 'delete')}
          >
            <span className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </span>
          </button>
          <button 
            className="block w-full px-4 py-2 text-left text-zinc-100 hover:bg-zinc-800/50"
            onClick={(e) => {
              handleActionClick(e, 'manage-stock')
              setSelectedProduct(product)
              setManageStockOpen(true)
            }}
          >
            <span className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Manage Stock
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

const columns = [
  { 
    id: 'name', 
    label: 'Product Name',
    icon: Package
  },
  { 
    id: 'sku', 
    label: 'SKU',
    icon: Hash
  },
  { 
    id: 'price', 
    label: 'Price',
    icon: DollarSign
  },
  { 
    id: 'stock', 
    label: 'Stock',
    icon: Boxes
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: AlertCircle
  },
  { 
    id: 'performance', 
    label: 'Performance',
    icon: BarChart2
  },
  { 
    id: 'category', 
    label: 'Category',
    icon: Package
  }
]

export function MarketProducts({ market }: MarketProductsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [priceAdjustOpen, setPriceAdjustOpen] = useState(false)
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0)
  const [isPercentage, setIsPercentage] = useState(true)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [manageStockOpen, setManageStockOpen] = useState(false)
  const { toast } = useToast()

  // Mock data - replace with real data from your API
  const products: MarketProduct[] = [
    {
      id: "1",
      name: "Product A",
      sku: "SKU001",
      price: 29.99,
      stock: 100,
      allocated: 50,
      sold: 30,
      performance: 85,
      category: "Electronics",
      status: 'in-stock'
    },
    {
      id: "2",
      name: "Product B",
      sku: "SKU002",
      price: 19.99,
      stock: 150,
      allocated: 75,
      sold: 45,
      performance: 75,
      category: "Clothing",
      status: 'low-stock'
    },
    // Add more mock products as needed
  ]

  const handlePriceAdjust = () => {
    if (!selectedProducts.length) {
      toast({
        title: "No products selected",
        description: "Please select products to adjust prices",
        variant: "destructive"
      })
      return
    }
    setPriceAdjustOpen(true)
  }

  const handleConfirmPriceAdjust = () => {
    // Implement price adjustment logic here
    toast({
      title: "Prices Updated",
      description: `Updated prices for ${selectedProducts.length} products`
    })
    setPriceAdjustOpen(false)
    setSelectedProducts([])
  }

  const handleBatchRemove = () => {
    if (!selectedProducts.length) {
      toast({
        title: "No products selected",
        description: "Please select products to remove",
        variant: "destructive"
      })
      return
    }
    // Implement batch remove logic here
    toast({
      title: "Products Removed",
      description: `Removed ${selectedProducts.length} products from market`
    })
    setSelectedProducts([])
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredProducts.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
      case 'low-stock':
        return 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
      case 'out-of-stock':
        return 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePriceAdjust}
            disabled={!selectedProducts.length}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Adjust Prices
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchRemove}
            disabled={!selectedProducts.length}
          >
            <Trash className="mr-2 h-4 w-4" />
            Remove
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>High Performance</DropdownMenuItem>
              <DropdownMenuItem>Low Stock</DropdownMenuItem>
              <DropdownMenuItem>Best Selling</DropdownMenuItem>
              <DropdownMenuItem>Category</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedProduct(product)
                setManageStockOpen(true)
              }}>
                <Package className="h-4 w-4 mr-2" />
                Manage Stock
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] h-12 px-2">
                <Checkbox
                  checked={selectedProducts.length === filteredProducts.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProducts(filteredProducts.map(p => p.id))
                    } else {
                      setSelectedProducts([])
                    }
                  }}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead 
                  key={column.id}
                  className="h-12 px-2"
                >
                  <div className="flex items-center gap-2">
                    <column.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{column.label}</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[40px] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((product) => (
              <TableRow key={product.id} className="h-16">
                <TableCell className="w-[40px] px-2">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProducts([...selectedProducts, product.id])
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="px-2">{product.name}</TableCell>
                <TableCell className="px-2">{product.sku}</TableCell>
                <TableCell className="px-2">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.price)}
                </TableCell>
                <TableCell className="px-2">
                  <div className="flex items-center gap-2">
                    <span>{product.allocated}/{product.stock}</span>
                    <Progress value={(product.allocated/product.stock) * 100} className="w-[60px]" />
                  </div>
                </TableCell>
                <TableCell className="px-2">
                  <Badge className={cn("font-medium", getStatusColor(product.status))}>
                    {product.status.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                </TableCell>
                <TableCell className="px-2">
                  <div className="flex items-center gap-2">
                    <Progress value={product.performance} className="w-[60px]" />
                    <span className="text-muted-foreground text-sm">{product.performance}%</span>
                  </div>
                </TableCell>
                <TableCell className="px-2">
                  <Badge variant="secondary">{product.category}</Badge>
                </TableCell>
                <TableCell className="w-[40px] px-2">
                  <ActionMenu product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value))
              setCurrentPage(0)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            items per page
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Price Adjustment Dialog */}
      <Dialog open={priceAdjustOpen} onOpenChange={setPriceAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Prices</DialogTitle>
            <DialogDescription>
              Adjust prices for {selectedProducts.length} selected products
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="percentage"
                    checked={isPercentage}
                    onCheckedChange={() => setIsPercentage(true)}
                  />
                  <label
                    htmlFor="percentage"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Percentage
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="amount"
                    checked={!isPercentage}
                    onCheckedChange={() => setIsPercentage(false)}
                  />
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Fixed Amount
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                {isPercentage ? "Percentage Change" : "Amount Change"}
              </Label>
              <Input
                type="number"
                value={priceAdjustment}
                onChange={(e) => setPriceAdjustment(parseFloat(e.target.value))}
                placeholder={isPercentage ? "Enter percentage" : "Enter amount"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceAdjustOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPriceAdjust}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Stock Dialog */}
      <ManageStockDialog
        open={manageStockOpen}
        onOpenChange={setManageStockOpen}
        product={selectedProduct}
        market={market}
      />
    </div>
  )
}
