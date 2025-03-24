import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { CategoryDialog } from '../components/CategoryDialog'
import { useToast } from '@/components/ui/use-toast'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mock data for expense categories
const mockCategories = [
  {
    id: '1',
    name: 'Rent',
    description: 'Office and retail space rent',
    budget: 1200,
    expenseCount: 12,
    totalSpent: 14400
  },
  {
    id: '2',
    name: 'Utilities',
    description: 'Electricity, water, internet, etc.',
    budget: 500,
    expenseCount: 36,
    totalSpent: 5430.25
  },
  {
    id: '3',
    name: 'Supplies',
    description: 'Office and store supplies',
    budget: 300,
    expenseCount: 24,
    totalSpent: 2845.75
  },
  {
    id: '4',
    name: 'Marketing',
    description: 'Advertising and promotional activities',
    budget: 1000,
    expenseCount: 18,
    totalSpent: 6350
  },
  {
    id: '5',
    name: 'Salaries',
    description: 'Employee salaries and benefits',
    budget: 10000,
    expenseCount: 12,
    totalSpent: 120000
  },
  {
    id: '6',
    name: 'Maintenance',
    description: 'Repairs and maintenance',
    budget: 400,
    expenseCount: 8,
    totalSpent: 1850.50
  }
]

export function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddCategory = (newCategory: any) => {
    if (currentCategory) {
      // Edit existing category
      setCategories(categories.map(cat => 
        cat.id === currentCategory.id ? { ...cat, ...newCategory } : cat
      ))
      toast({
        title: "Category Updated",
        description: "The expense category has been updated successfully.",
      })
    } else {
      // Add new category
      setCategories([
        ...categories,
        {
          id: (categories.length + 1).toString(),
          ...newCategory,
          expenseCount: 0,
          totalSpent: 0
        }
      ])
      toast({
        title: "Category Added",
        description: "The new expense category has been added successfully.",
      })
    }
    setIsDialogOpen(false)
    setCurrentCategory(null)
  }

  const handleEditCategory = (category: any) => {
    setCurrentCategory(category)
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = (category: any) => {
    setCurrentCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    setCategories(categories.filter(cat => cat.id !== currentCategory.id))
    setIsDeleteDialogOpen(false)
    setCurrentCategory(null)
    toast({
      title: "Category Deleted",
      description: "The expense category has been deleted successfully.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Expense Categories</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budget (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${categories.reduce((sum, cat) => sum + cat.budget, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${categories.reduce((sum, cat) => sum + cat.totalSpent, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Highest Budget Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 ? 
                categories.reduce((prev, current) => 
                  prev.budget > current.budget ? prev : current
                ).name : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Monthly Budget</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell className="text-right">${category.budget.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{category.expenseCount}</TableCell>
                  <TableCell className="text-right">${category.totalSpent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <CategoryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleAddCategory}
        category={currentCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {currentCategory?.name} category and cannot be undone.
              {currentCategory?.expenseCount > 0 && (
                <span className="block mt-2 font-semibold text-destructive">
                  Warning: This category has {currentCategory?.expenseCount} expenses associated with it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
