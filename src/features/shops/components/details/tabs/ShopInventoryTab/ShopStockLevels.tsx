import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Barcode,
  FolderOpen,
  DollarSign,
  Package,
  MoreHorizontal,
  ArrowLeftRight,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ShopStockLevelsProps {
  shopId: string;
}

/**
 * Component for displaying and managing shop stock levels
 */
export function ShopStockLevels({ shopId }: ShopStockLevelsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>({ column: 'name', direction: 'asc' });

  // Simulated product data
  useEffect(() => {
    // In a real app, you would fetch products for this specific shop
    // Example API call: fetchProductsByShopId(shopId)
    const fetchProducts = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - in a real app this would come from an API
      const mockProducts = [
        { id: 1, name: 'T-Shirt', sku: 'TS-001', category: 'Apparel', stock: 32, lowStockThreshold: 10, price: 19.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 2, name: 'Jeans', sku: 'JN-002', category: 'Apparel', stock: 8, lowStockThreshold: 10, price: 49.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 3, name: 'Sneakers', sku: 'SN-003', category: 'Footwear', stock: 15, lowStockThreshold: 5, price: 89.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 4, name: 'Watch', sku: 'WT-004', category: 'Accessories', stock: 4, lowStockThreshold: 5, price: 129.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 5, name: 'Backpack', sku: 'BP-005', category: 'Accessories', stock: 0, lowStockThreshold: 3, price: 39.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 6, name: 'Headphones', sku: 'HP-006', category: 'Electronics', stock: 12, lowStockThreshold: 5, price: 59.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 7, name: 'Phone Case', sku: 'PC-007', category: 'Electronics', stock: 25, lowStockThreshold: 10, price: 24.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 8, name: 'Charger', sku: 'CH-008', category: 'Electronics', stock: 7, lowStockThreshold: 10, price: 14.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 9, name: 'Hat', sku: 'HT-009', category: 'Apparel', stock: 18, lowStockThreshold: 8, price: 17.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 10, name: 'Sunglasses', sku: 'SG-010', category: 'Accessories', stock: 6, lowStockThreshold: 5, price: 29.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 11, name: 'Socks', sku: 'SK-011', category: 'Apparel', stock: 42, lowStockThreshold: 15, price: 9.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 12, name: 'Wallet', sku: 'WL-012', category: 'Accessories', stock: 11, lowStockThreshold: 5, price: 34.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 13, name: 'Belt', sku: 'BT-013', category: 'Accessories', stock: 9, lowStockThreshold: 5, price: 24.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 14, name: 'Scarf', sku: 'SC-014', category: 'Apparel', stock: 3, lowStockThreshold: 8, price: 19.99, actions: ['adjust', 'transfer', 'history'] },
        { id: 15, name: 'Gloves', sku: 'GL-015', category: 'Apparel', stock: 0, lowStockThreshold: 5, price: 14.99, actions: ['adjust', 'transfer', 'history'] },
      ];
      
      setProducts(mockProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [shopId]);

  // Filter and search products
  const filteredProducts = products.filter(product => {
    // Apply stock filter
    if (stockFilter === 'low' && product.stock > product.lowStockThreshold) return false;
    if (stockFilter === 'out' && product.stock > 0) return false;
    
    // Apply search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.sku.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;  
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { column, direction } = sortConfig;
    
    // Handle different column types
    if (column === 'stock' || column === 'price') {
      return direction === 'asc' 
        ? a[column] - b[column]
        : b[column] - a[column];
    }
    
    // Default string sort
    return direction === 'asc'
      ? a[column].localeCompare(b[column])
      : b[column].localeCompare(a[column]);
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: string) => {
    setSortConfig(current => {
      if (current?.column === column) {
        return {
          column,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        column,
        direction: 'asc'
      };
    });
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'destructive' };
    if (stock < threshold) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const handleAdjustStock = (productId: number) => {
    console.log(`Adjust stock for product ${productId}`);
    // Implementation would handle stock adjustment
  };

  const handleTransferStock = (productId: number) => {
    console.log(`Transfer stock for product ${productId}`);
    // Implementation would handle stock transfer
  };

  const handleViewHistory = (productId: number) => {
    console.log(`View history for product ${productId}`);
    // Implementation would show product history
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1" onClick={() => setSelectedProducts([])}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop Inventory</CardTitle>
          <CardDescription>Current stock levels at this shop location</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[50px] p-3">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onCheckedChange={() => {
                              setSelectedProducts(
                                selectedProducts.length === filteredProducts.length
                                  ? []
                                  : filteredProducts.map(product => product.id)
                              )
                            }}
                            aria-label="Select all products"
                          />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          <span>Product</span>
                          {sortConfig?.column === 'name' && (
                            sortConfig.direction === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleSort('sku')}
                      >
                        <div className="flex items-center gap-2">
                          <Barcode className="h-4 w-4" />
                          <span>SKU</span>
                          {sortConfig?.column === 'sku' && (
                            sortConfig.direction === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          <span>Category</span>
                          {sortConfig?.column === 'category' && (
                            sortConfig.direction === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors text-right"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center gap-2 justify-end">
                          <DollarSign className="h-4 w-4" />
                          <span>Price</span>
                          {sortConfig?.column === 'price' && (
                            sortConfig.direction === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors text-right"
                        onClick={() => handleSort('stock')}
                      >
                        <div className="flex items-center gap-2 justify-end">
                          <Package className="h-4 w-4" />
                          <span>Stock</span>
                          {sortConfig?.column === 'stock' && (
                            sortConfig.direction === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map(product => {
                        const status = getStockStatus(product.stock, product.lowStockThreshold);
                        return (
                          <TableRow 
                            key={product.id}
                            className={cn(
                              "border-b border-border transition-colors hover:bg-muted/50",
                              selectedProducts.includes(product.id) && "bg-muted"
                            )}
                            onClick={() => {
                              setSelectedProducts(current =>
                                current.includes(product.id)
                                  ? current.filter(id => id !== product.id)
                                  : [...current, product.id]
                              );
                            }}
                          >
                            <TableCell className="p-3">
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={selectedProducts.includes(product.id)}
                                  aria-label={`Select ${product.name}`}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedProducts(prev => [...prev, product.id]);
                                    } else {
                                      setSelectedProducts(prev => prev.filter(id => id !== product.id));
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{product.stock}</TableCell>
                            <TableCell>
                              <Badge variant={status.color as "default" | "secondary" | "destructive" | "outline"}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleAdjustStock(product.id)}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    <span>Adjust Stock</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTransferStock(product.id)}>
                                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                                    <span>Transfer Stock</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewHistory(product.id)}>
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    <span>View History</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                          No products matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous</span>
                  </Button>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
