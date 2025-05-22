import { Card, CardContent } from "@/components/ui/card"
import {
  Package,
  ArrowLeftRight,
  History,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Search
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock recent products - in a real app, this would come from an API
const recentProducts = [
  { id: 'prod-123456', name: 'Premium Bluetooth Headphones', sku: 'BT-HDPHN-001', stock: 45, status: 'In Stock' },
  { id: 'prod-234567', name: 'Wireless Gaming Mouse', sku: 'WL-MOUSE-002', stock: 12, status: 'Low Stock' },
  { id: 'prod-345678', name: 'Mechanical Keyboard', sku: 'KB-MECH-003', stock: 0, status: 'Out of Stock' },
  { id: 'prod-456789', name: 'USB-C Fast Charger', sku: 'CHRG-USBC-004', stock: 32, status: 'In Stock' },
  { id: 'prod-567890', name: '4K Monitor 27"', sku: 'MON-4K-005', stock: 8, status: 'Low Stock' },
];

export function InventoryManagementPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(recentProducts)

  // Handle card click navigation
  const handleCardClick = (path: string) => {
    try {
      navigate(path)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to direct URL change if navigate fails
      window.location.href = path
    }
  }

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(recentProducts);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = recentProducts.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.sku.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredProducts(filtered);
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Get badge variant based on stock status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'In Stock': return 'default';
      case 'Low Stock': return 'warning';
      case 'Out of Stock': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Manage stock levels and inventory operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
          onClick={() => handleCardClick('/inventory/stock-levels')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-center">Stock Levels</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              View and manage current inventory levels
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick('/inventory/stock-levels')
              }}
            >
              View Stock Levels
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
          onClick={() => handleCardClick('/inventory/receive')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-center">Receive Stock</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              Record incoming inventory from suppliers
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick('/inventory/receive')
              }}
            >
              Receive Stock
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
          onClick={() => handleCardClick('/inventory/transfer')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-center">Transfer Stock</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              Move inventory between locations
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick('/inventory/transfer')
              }}
            >
              Transfer Stock
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
          onClick={() => handleCardClick('/inventory/adjustments')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-center">Adjustments</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              Make manual inventory adjustments
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick('/inventory/adjustments')
              }}
            >
              View Adjustments
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
          onClick={() => handleCardClick('/inventory/history')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-center">History</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              View inventory transaction history
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick('/inventory/history')
              }}
            >
              View History
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
          onClick={() => handleCardClick('/inventory/alerts')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-center">Alerts</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
              Manage low stock and inventory alerts
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick('/inventory/alerts')
              }}
            >
              View Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products Section */}
      <div className="mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Products</h2>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full"
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/products/${product.id}?tab=inventory`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <Link to="/products">
                <Button variant="link">View All Products</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
