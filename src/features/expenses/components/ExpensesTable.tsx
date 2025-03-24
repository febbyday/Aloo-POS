import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Edit, MoreHorizontal, Trash2, FileText, Printer, Eye } from 'lucide-react'
import { ExpenseDialog } from './ExpenseDialog'
import { useToast } from '@/components/ui/use-toast'

interface Expense {
  id: string
  date: string
  category: string
  amount: number
  paymentMethod: string
  description: string
  status: string
  attachments: number
}

interface ExpensesTableProps {
  expenses: Expense[]
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)
  const { toast } = useToast()

  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDeleteExpense = (expense: Expense) => {
    toast({
      title: "Expense Deleted",
      description: `Expense "${expense.description}" has been deleted.`,
    })
  }

  const handleViewReceipt = (expense: Expense) => {
    toast({
      title: "Viewing Receipt",
      description: `Opening receipt for "${expense.description}".`,
    })
  }

  const handlePrintExpense = (expense: Expense) => {
    toast({
      title: "Printing Expense",
      description: `Printing expense "${expense.description}".`,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Attachments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No expenses found. Add an expense to get started.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={expense.description}>
                      {expense.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.status === 'Paid' ? 'default' : 'outline'}
                        className={expense.status === 'Paid' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {expense.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {expense.attachments > 0 ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewReceipt(expense)}
                          className="h-6 w-6"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintExpense(expense)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          {expense.attachments > 0 && (
                            <DropdownMenuItem onClick={() => handleViewReceipt(expense)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Receipt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteExpense(expense)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ExpenseDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        expense={currentExpense}
        onSave={() => {
          setIsDialogOpen(false)
          toast({
            title: "Expense Updated",
            description: "The expense has been successfully updated.",
          })
        }} 
      />
    </>
  )
}
