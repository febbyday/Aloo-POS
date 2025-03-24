// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Hash,
  User,
  Phone,
  Package,
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import { ActionMenu } from "./ActionMenu"
import { cn } from "@/lib/utils"
import { Repair, RepairStatus } from "../types"

const columns = [
  { 
    id: 'ticketNumber', 
    label: 'Ticket #',
    icon: Hash
  },
  { 
    id: 'customerName', 
    label: 'Customer',
    icon: User
  },
  { 
    id: 'customerPhone', 
    label: 'Phone',
    icon: Phone
  },
  { 
    id: 'productName', 
    label: 'Product',
    icon: Package
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: AlertCircle
  },
  { 
    id: 'createdAt', 
    label: 'Created',
    icon: Calendar
  },
  { 
    id: 'estimatedCompletionDate', 
    label: 'Est. Completion',
    icon: Clock
  },
  { 
    id: 'estimatedCost', 
    label: 'Est. Cost',
    icon: DollarSign
  }
]

// Define status colors for badges
const statusColors: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  "in progress": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "waiting for parts": "bg-purple-100 text-purple-800 hover:bg-purple-200",
  "ready for testing": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  "completed": "bg-green-100 text-green-800 hover:bg-green-200",
  "delivered": "bg-teal-100 text-teal-800 hover:bg-teal-200",
  "cancelled": "bg-red-100 text-red-800 hover:bg-red-200"
};

export function RepairsTable({ 
  repairs = [], 
  onView, 
  onEdit, 
  onDelete 
}: { 
  repairs: Repair[]; 
  onView: (repair: Repair) => void;
  onEdit: (repair: Repair) => void;
  onDelete: (repair: Repair) => void;
}) {
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'}>({ column: 'createdAt', direction: 'desc' })
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = repairs.slice(startIndex, endIndex)
  const totalPages = Math.ceil(repairs.length / itemsPerPage)

  // Handle row selection
  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRepairs(repairs.map(repair => repair.id))
    } else {
      setSelectedRepairs([])
    }
  }

  // Handle individual row selection
  const handleSelectRow = (checked: boolean, repairId: string) => {
    if (checked) {
      setSelectedRepairs([...selectedRepairs, repairId])
    } else {
      setSelectedRepairs(selectedRepairs.filter(id => id !== repairId))
    }
  }

  // Handle sorting
  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.column === column) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc'
    }
    
    setSortConfig({ column, direction })
  }

  const getStatusBadgeVariant = (status: RepairStatus) => {
    switch (status) {
      case RepairStatus.PENDING:
        return 'default'
      case RepairStatus.IN_PROGRESS:
        return 'secondary'
      case RepairStatus.WAITING_PARTS:
        return
      case RepairStatus.READY_FOR_TESTING:
        return 'warning'
      case RepairStatus.COMPLETED:
        return 'success'
      case RepairStatus.DELIVERED:
        return 'info'
      case RepairStatus.CANCELLED:
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getSortIcon = (column: string) => {
    if (sortConfig.column === column) {
      return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    return <ChevronsUpDown className="h-4 w-4 opacity-30" />
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] h-12">
                <Checkbox
                  checked={selectedRepairs.length === paginatedData.length}
                  onCheckedChange={handleSelectAllRows}
                  aria-label="Select all repairs"
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className="h-12 cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <column.icon className="h-4 w-4" />
                    <span className="text-muted-foreground">{column.label}</span>
                    <div className="w-4">
                      {getSortIcon(column.id)}
                    </div>
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((repair) => (
              <TableRow
                key={repair.id}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
                  selectedRepairs.includes(repair.id) && "bg-muted"
                )}
              >
                <TableCell className="h-[50px] py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRepairs.includes(repair.id)}
                    onCheckedChange={(checked: boolean) => handleSelectRow(checked as boolean, repair.id)}
                    aria-label={`Select repair ${repair.ticketNumber}`}
                  />
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="font-medium text-muted-foreground">{repair.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        {repair.productBrand} {repair.productModel}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="h-[50px] py-3">#{repair.ticketNumber}</TableCell>
                <TableCell className="h-[50px] py-3">
                  <span className="font-medium text-muted-foreground">${repair.estimatedCost.toFixed(2)}</span>
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <Badge className={statusColors[repair.status.toLowerCase()] || "bg-gray-100 text-gray-800"}>
                    {repair.status}
                  </Badge>
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <ActionMenu
                    repair={repair}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(0)
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, repairs.length)} of {repairs.length} entries
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-8 px-3 py-1.5"
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <Button
              key={page}
              variant={currentPage === page - 1 ? "default" : "outline"}
              className="h-8 px-3 py-1.5 hidden md:inline-flex"
              onClick={() => setCurrentPage(page - 1)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-8 px-3 py-1.5"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
