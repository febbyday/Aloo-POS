import { cn } from '@/lib/utils/cn';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Transaction, TransactionFilter } from '../pages/TransactionBrowserPage'
import { MoreHorizontal, Eye, FileDown, Receipt, Calendar, User, DollarSign, Store, CreditCard, CircleDot } from 'lucide-react'
import { tableStyles } from "@/components/ui/shared-table-styles"
import React from 'react'

interface TransactionsTableProps {
  filters: TransactionFilter
  data?: Transaction[]
  onViewDetails?: (transaction: Transaction) => void
  onExportPdf?: (transaction: Transaction) => void
}

interface ActionMenuProps {
  transaction: Transaction
  onExportPdf?: (transaction: Transaction) => void
}

function ActionMenu({ transaction, onExportPdf }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-8 w-8 p-0 hover:bg-accent">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onExportPdf?.(transaction)}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getStatusColor(status: Transaction['status']) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'refunded':
      return 'destructive'
    case 'partially_refunded':
      return 'warning'
    default:
      return 'default'
  }
}

function getPaymentMethodColor(method: Transaction['paymentMethod']) {
  switch (method) {
    case 'cash':
      return 'success'
    case 'card':
      return 'default'
    case 'mobile':
      return 'warning'
    default:
      return 'default'
  }
}

export function TransactionsTable({
  filters,
  data = [],
  onViewDetails,
  onExportPdf
}: TransactionsTableProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])

  const toggleAllRows = React.useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(data.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }, [data])

  const toggleRowSelection = React.useCallback((id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      }
      return [...prev, id]
    })
  }, [])

  // Filter transactions based on search and filters
  const filteredTransactions = React.useMemo(() => {
    return data.filter(transaction => {
      if (filters.search && !transaction.reference.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.status && transaction.status !== filters.status) {
        return false
      }
      if (filters.paymentMethod && transaction.paymentMethod !== filters.paymentMethod) {
        return false
      }
      if (filters.location && transaction.location !== filters.location) {
        return false
      }
      if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
        return false
      }
      if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
        return false
      }
      return true
    })
  }, [data, filters])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} items selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.length === 1 && (
            <>
              <button
                onClick={() => {
                  const transaction = data.find(t => t.id === selectedItems[0])
                  if (transaction && onViewDetails) {
                    onViewDetails(transaction)
                  }
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  const transaction = data.find(t => t.id === selectedItems[0])
                  if (transaction && onExportPdf) {
                    onExportPdf(transaction)
                  }
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedItems.length === filteredTransactions.length && filteredTransactions.length > 0}
                  onCheckedChange={toggleAllRows}
                  aria-label="Select all transactions"
                />
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <Receipt className="h-4 w-4" />
                  <span>Reference</span>
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <User className="h-4 w-4" />
                  <span>Customer</span>
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <DollarSign className="h-4 w-4" />
                  <span>Total</span>
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <CreditCard className="h-4 w-4" />
                  <span>Payment</span>
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <CircleDot className="h-4 w-4" />
                  <span>Status</span>
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <Store className="h-4 w-4" />
                  <span>Location</span>
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent}>
                  <span>Items</span>
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className={tableStyles.headerCellContent}>
                  <span>Actions</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className={cn(
                  "border-b border-zinc-800 transition-colors hover:bg-white/5 cursor-pointer",
                  selectedItems.includes(transaction.id) && "bg-white/10"
                )}
                onClick={() => toggleRowSelection(transaction.id)}
              >
                <TableCell className="w-[40px]">
                  <Checkbox
                    checked={selectedItems.includes(transaction.id)}
                    onCheckedChange={() => toggleRowSelection(transaction.id)}
                    aria-label={`Select transaction ${transaction.reference}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.reference}
                </TableCell>
                <TableCell>
                  {transaction.date.toLocaleString()}
                </TableCell>
                <TableCell>
                  {transaction.customer || 'Walk-in Customer'}
                </TableCell>
                <TableCell>
                  ${transaction.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentMethodColor(transaction.paymentMethod)} className="capitalize">
                    {transaction.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(transaction.status)} className="capitalize">
                    {transaction.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {transaction.location}
                </TableCell>
                <TableCell>
                  {transaction.items.length} items
                </TableCell>
                <TableCell className="text-right">
                  <ActionMenu 
                    transaction={transaction}
                    onExportPdf={onExportPdf}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
