import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  Filter, 
  Download, 
  Printer,
  Calendar,
  User,
  Package
} from "lucide-react"

// Mock data - replace with real data from your backend
const mockHistory = [
  {
    id: "1",
    date: "2024-01-15 14:30",
    user: "John Doe",
    template: "Standard Product Label",
    products: "Product A, Product B",
    quantity: 50,
    printer: "Printer 1",
    status: "Completed",
  },
  {
    id: "2",
    date: "2024-01-15 13:15",
    user: "Jane Smith",
    template: "Price Tag",
    products: "Product C",
    quantity: 100,
    printer: "Printer 2",
    status: "Completed",
  },
  // Add more mock data as needed
]

export function LabelHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [printerFilter, setPrinterFilter] = useState("all")

  // Filter history based on search query and filters
  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch = 
      item.template.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.products.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = dateFilter === "all" || true // Implement date filtering logic
    const matchesPrinter = printerFilter === "all" || item.printer === printerFilter

    return matchesSearch && matchesDate && matchesPrinter
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by template, product, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Select value={printerFilter} onValueChange={setPrinterFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Printer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Printers</SelectItem>
            <SelectItem value="Printer 1">Printer 1</SelectItem>
            <SelectItem value="Printer 2">Printer 2</SelectItem>
            <SelectItem value="Printer 3">Printer 3</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* History Table */}
      <Card>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Printer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {item.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {item.user}
                    </div>
                  </TableCell>
                  <TableCell>{item.template}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {item.products}
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4 text-muted-foreground" />
                      {item.printer}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
} 