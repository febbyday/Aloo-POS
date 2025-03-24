import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CustomerGroup } from "../../types"
import { mockCustomerGroups } from "../../mocks/pricingData"
import { useState } from "react"
import { 
  Users,
  FileText,
  Percent,
  DollarSign,
} from "lucide-react"

interface CustomerGroupsTableProps {
  data?: CustomerGroup[]
}

const columns = [
  { 
    id: 'name',
    label: 'Group Name',
    icon: Users
  },
  { 
    id: 'description',
    label: 'Description',
    icon: FileText
  },
  { 
    id: 'discountType',
    label: 'Discount Type',
    icon: Percent
  },
  { 
    id: 'discountValue',
    label: 'Discount Value',
    icon: DollarSign
  }
]

export function CustomerGroupsTable({ data = mockCustomerGroups }: CustomerGroupsTableProps) {
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className="h-12"
                >
                  <div className="flex items-center gap-2">
                    <column.icon className="h-4 w-4" />
                    <span>{column.label}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((group) => (
              <TableRow key={group.id} className="transition-colors hover:bg-white/5">
                <TableCell className="text-zinc-100 h-[50px] py-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    {group.name}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-100 h-[50px] py-3">{group.description || "-"}</TableCell>
                <TableCell className="text-zinc-100 h-[50px] py-3">
                  <Badge variant="outline">
                    {group.discountType.charAt(0).toUpperCase() + group.discountType.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-100 h-[50px] py-3">
                  {group.discountType === "percentage" 
                    ? `${group.discountValue}%`
                    : new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(group.discountValue)
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Show</span>
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
            <span className="text-sm text-zinc-500">entries</span>
          </div>
          <div className="text-sm text-zinc-500">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
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
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
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

export default CustomerGroupsTable;
