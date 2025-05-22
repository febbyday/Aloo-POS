import { useState } from 'react'
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileDown,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { TransactionsTable } from '../components/TransactionsTable'
import { TransactionDetailsDialog } from '../components/TransactionDetailsDialog'
import { useToast } from '@/lib/toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils';

export interface TransactionItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

export interface Transaction {
  id: string
  reference: string
  date: Date
  customer: string | null
  total: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  status: 'completed' | 'refunded' | 'partially_refunded'
  location: string
  items: TransactionItem[]
}

export interface TransactionFilter {
  search: string
  status: Transaction['status'] | null
  paymentMethod: Transaction['paymentMethod'] | null
  location: string | null
  startDate: string | null
  endDate: string | null
  minAmount: number | undefined
  maxAmount: number | undefined
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    reference: 'TRX-001',
    date: new Date('2024-02-17T14:30:00'),
    customer: 'John Doe',
    total: 299.99,
    paymentMethod: 'card',
    status: 'completed',
    location: 'store1',
    items: [
      {
        id: '1',
        name: 'T-Shirt',
        quantity: 2,
        price: 29.99,
        total: 59.98
      },
      {
        id: '2',
        name: 'Jeans',
        quantity: 1,
        price: 89.99,
        total: 89.99
      }
    ]
  },
  {
    id: '2',
    reference: 'TRX-002',
    date: new Date('2024-02-17T15:45:00'),
    customer: null,
    total: 150.00,
    paymentMethod: 'cash',
    status: 'refunded',
    location: 'store2',
    items: [
      {
        id: '3',
        name: 'Sneakers',
        quantity: 1,
        price: 150.00,
        total: 150.00
      }
    ]
  }
]

export function TransactionBrowserPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<TransactionFilter>({
    search: '',
    status: null,
    paymentMethod: null,
    location: null,
    startDate: null,
    endDate: null,
    minAmount: undefined,
    maxAmount: undefined
  })
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your transaction data is being updated."
    })
  }

  const handleExport = () => {
    toast({
      title: "Exporting transactions...",
      description: "Your export will be ready shortly."
    })
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="bg-zinc-900 px-4 py-2 flex items-center gap-2 -mx-4 -mt-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-zinc-400 hover:text-white hover:bg-white/10"
          onClick={handleExport}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Advanced Search & Filters */}
      <div className="grid gap-4">
        <div className="grid grid-cols-[1fr,300px,200px,200px] gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !filters.startDate && !filters.endDate && "text-muted-foreground"
                )}
              >
                {filters.startDate && filters.endDate ? (
                  <>
                    {format(new Date(filters.startDate), "LLL dd, y")} -{" "}
                    {format(new Date(filters.endDate), "LLL dd, y")}
                  </>
                ) : filters.startDate ? (
                  format(new Date(filters.startDate), "LLL dd, y")
                ) : filters.endDate ? (
                  format(new Date(filters.endDate), "LLL dd, y")
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="border-b border-border p-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Select Range</h4>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 hover:bg-transparent hover:text-primary"
                    onClick={() => setFilters(prev => ({ ...prev, startDate: null, endDate: null }))}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex gap-2">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.startDate ? new Date(filters.startDate) : undefined}
                    selected={{
                      from: filters.startDate ? new Date(filters.startDate) : undefined,
                      to: filters.endDate ? new Date(filters.endDate) : undefined,
                    }}
                    onSelect={(range) =>
                      setFilters(prev => ({
                        ...prev,
                        startDate: range ? range.from?.toISOString().split('T')[0] : null,
                        endDate: range ? range.to?.toISOString().split('T')[0] : null
                      }))
                    }
                    numberOfMonths={2}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select
            value={filters.status}
            onValueChange={(value: Transaction['status']) =>
              setFilters(prev => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.paymentMethod}
            onValueChange={(value: Transaction['paymentMethod']) =>
              setFilters(prev => ({ ...prev, paymentMethod: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-[1fr,1fr,200px,auto] gap-4">
          <Input
            type="number"
            placeholder="Min Amount"
            value={filters.minAmount}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              minAmount: e.target.value ? Number(e.target.value) : undefined
            }))}
          />

          <Input
            type="number"
            placeholder="Max Amount"
            value={filters.maxAmount}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              maxAmount: e.target.value ? Number(e.target.value) : undefined
            }))}
          />

          <Select
            value={filters.location}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, location: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="store1">Store 1</SelectItem>
              <SelectItem value="store2">Store 2</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setFilters({
              search: '',
              status: null,
              paymentMethod: null,
              location: null,
              startDate: null,
              endDate: null,
              minAmount: undefined,
              maxAmount: undefined
            })}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsTable
        data={mockTransactions}
        filters={filters}
        onViewDetails={(transaction) => {
          setSelectedTransaction(transaction)
        }}
        onExportPdf={(transaction) => {
          toast({
            title: "Exporting PDF",
            description: `Exporting transaction ${transaction.reference} to PDF...`
          })
        }}
      />

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  )
}
