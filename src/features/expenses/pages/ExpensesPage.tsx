import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpensesTable } from '../components/ExpensesTable'
import { ExpenseDialog } from '../components/ExpenseDialog'
import { Plus, Download, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Mock data for expenses
const mockExpenses = [
  {
    id: '1',
    date: '2025-02-15',
    category: 'Rent',
    amount: 1200,
    paymentMethod: 'Bank Transfer',
    description: 'Monthly rent payment',
    status: 'Paid',
    attachments: 1
  },
  {
    id: '2',
    date: '2025-02-10',
    category: 'Utilities',
    amount: 150.75,
    paymentMethod: 'Credit Card',
    description: 'Electricity bill',
    status: 'Paid',
    attachments: 1
  },
  {
    id: '3',
    date: '2025-02-05',
    category: 'Supplies',
    amount: 85.25,
    paymentMethod: 'Cash',
    description: 'Office supplies',
    status: 'Paid',
    attachments: 0
  },
  {
    id: '4',
    date: '2025-02-01',
    category: 'Marketing',
    amount: 350,
    paymentMethod: 'Credit Card',
    description: 'Social media advertising',
    status: 'Pending',
    attachments: 2
  },
  {
    id: '5',
    date: '2025-01-28',
    category: 'Salaries',
    amount: 3500,
    paymentMethod: 'Bank Transfer',
    description: 'Staff salaries',
    status: 'Paid',
    attachments: 0
  }
]

export function ExpensesPage() {
  const [expenses, setExpenses] = useState(mockExpenses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const { toast } = useToast()

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || expense.status.toLowerCase() === selectedStatus.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const handleAddExpense = (newExpense: any) => {
    setExpenses([
      {
        id: (expenses.length + 1).toString(),
        ...newExpense,
        status: 'Pending',
        attachments: 0
      },
      ...expenses
    ])
    setIsDialogOpen(false)
    toast({
      title: "Expense Added",
      description: "The expense has been successfully added.",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Exporting Data",
      description: "Your expense data is being exported.",
    })
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: "Your expense data is being refreshed.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,285.00</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$350.00</div>
            <p className="text-xs text-muted-foreground">
              1 expense awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Largest Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Salaries</div>
            <p className="text-xs text-muted-foreground">
              66% of total expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Daily Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$176.17</div>
            <p className="text-xs text-muted-foreground">
              Based on this month's data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={handleExportData}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Expenses Table */}
      <ExpensesTable expenses={filteredExpenses} />

      {/* Add Expense Dialog */}
      <ExpenseDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleAddExpense} 
      />
    </div>
  )
}
