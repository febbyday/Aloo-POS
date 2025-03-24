import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PriceHistory } from "../../types"
import { mockPriceHistory } from "../../mocks/pricingData"
import { useState } from "react"
import { 
  Calendar,
  Package,
  DollarSign,
  Info,
  User,
  RefreshCw,
  FileDown,
  Pencil,
  ChevronsUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface PriceHistoryTableProps {
  data?: PriceHistory[]
}

const columns = [
  { 
    id: 'date',
    label: 'Date',
    icon: Calendar
  },
  { 
    id: 'product',
    label: 'Product',
    icon: Package
  },
  { 
    id: 'price',
    label: 'Price',
    icon: DollarSign
  },
  { 
    id: 'reason',
    label: 'Reason',
    icon: Info
  },
  { 
    id: 'updatedBy',
    label: 'Updated By',
    icon: User
  }
]

export function PriceHistoryTable({ data = mockPriceHistory }: PriceHistoryTableProps) {
  const [itemsPerPage] = useState(10)
  const [currentPage] = useState(0)

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="h-8 w-[1px] bg-border" />
          <Button variant="outline" size="sm" className="h-8">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Prices
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 w-[200px]"
            placeholder="Search products..."
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground border-none shadow-none">
        <div className="p-0">
          <div className="relative w-full overflow-auto">
            <div className="space-y-4 [&_[role=cell]]:py-3">
              <div className="rounded-md">
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-2 text-left align-middle font-medium text-zinc-100 h-[50px] cursor-pointer hover:bg-zinc-800/50">
                          <div className="flex items-center gap-2">
                            <Checkbox className="translate-y-[2px]" />
                          </div>
                        </TableHead>
                        {columns.map((column) => (
                          <TableHead
                            key={column.id}
                            className="px-2 text-left align-middle font-medium text-zinc-100 h-[50px] cursor-pointer hover:bg-zinc-800/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <column.icon className="h-4 w-4 text-muted-foreground" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                                >
                                  {column.label}
                                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                              <div className="w-4">
                                <ChevronsUpDown className="h-4 w-4 opacity-30" />
                              </div>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((history) => (
                        <TableRow
                          key={history.id}
                          className="transition-colors data-[state=selected]:bg-muted cursor-pointer"
                          data-state="false"
                        >
                          <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                            <Checkbox className="translate-y-[2px]" />
                          </TableCell>
                          <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="flex items-center">
                              <span className="text-muted-foreground">
                                {new Date(history.date).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{history.productId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="font-medium tabular-nums">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(history.price)}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="flex items-center">
                              <span className="text-muted-foreground">{history.reason || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="flex items-center">
                              <span className="text-muted-foreground">{history.updatedBy}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Show</span>
                    <Select defaultValue="10">
                      <Select.Trigger className="w-[70px]">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="10">10</Select.Item>
                        <Select.Item value="20">20</Select.Item>
                        <Select.Item value="30">30</Select.Item>
                        <Select.Item value="40">40</Select.Item>
                        <Select.Item value="50">50</Select.Item>
                      </Select.Content>
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
                    size="sm"
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="hidden md:inline-flex"
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={endIndex >= data.length}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceHistoryTable;
