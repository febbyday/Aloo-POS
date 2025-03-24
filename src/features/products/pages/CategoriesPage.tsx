import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { AddCategoryPopup } from '../components/AddCategoryPopup'
import { EditCategoryPopup } from '../components/EditCategoryPopup'
import { DeleteCategoryPopup } from '../components/DeleteCategoryPopup'
import { ProductsToolbar } from '../components/ProductsToolbar'
import { 
  FolderPlus,
  Pencil,
  Printer,
  RefreshCw,
  Trash,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Check,
  FolderOpen,
  Hash,
  AlignLeft,
  FolderTree
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data - replace with actual API call
const categories = [
  {
    id: "1",
    name: "Apparel",
    products: 150,
    description: "Clothing and accessories",
    parent: "Fashion"
  },
  {
    id: "2",
    name: "Electronics",
    products: 200,
    description: "Electronic devices and accessories",
    parent: "Technology"
  },
  {
    id: "3",
    name: "Home & Living",
    products: 180,
    description: "Home decor and furniture",
    parent: "Lifestyle"
  }
]

const columns = [
  { 
    id: 'name', 
    label: 'Name',
    icon: FolderOpen
  },
  { 
    id: 'products', 
    label: 'Products',
    icon: Hash
  },
  { 
    id: 'description', 
    label: 'Description',
    icon: AlignLeft
  },
  { 
    id: 'parent', 
    label: 'Parent Category',
    icon: FolderTree
  }
]

export function CategoriesPage() {
  const { toast } = useToast()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'} | null>(null)
  const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.id))
  const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false)
  const [isEditCategoryPopupOpen, setIsEditCategoryPopupOpen] = useState(false)
  const [isDeleteCategoryPopupOpen, setIsDeleteCategoryPopupOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{
    id: string
    name: string
    products: number
    description: string
    parent: string
  } | null>(null)

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: () => {
            toast({
              title: "Refreshing categories...",
              description: "Your categories are being updated."
            })
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: FolderPlus,
          label: "New Category",
          onClick: () => setIsAddCategoryPopupOpen(true)
        },
        {
          icon: Pencil,
          label: "Edit Category",
          onClick: () => {
            if (selectedCategories.length === 1) {
              const categoryToEdit = categories.find(c => c.id === selectedCategories[0])
              if (categoryToEdit) {
                setEditingCategory(categoryToEdit)
                setIsEditCategoryPopupOpen(true)
              }
            }
          },
          disabled: selectedCategories.length !== 1
        },
        {
          icon: Trash,
          label: "Delete Category",
          onClick: () => {
            if (selectedCategories.length > 0) {
              setIsDeleteCategoryPopupOpen(true)
            }
          },
          disabled: selectedCategories.length === 0
        }
      ]
    },
  ]

  // Filter and sort data
  const filteredData = categories.filter(item => {
    const matchesSearch = searchTerm === "" || 
      Object.values(item).some(val => 
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    return matchesSearch
  })

  // Sort data
  const sortedData = sortConfig 
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.column as keyof typeof a]
        const bVal = b[sortConfig.column as keyof typeof b]
        const modifier = sortConfig.direction === 'asc' ? 1 : -1
        return aVal < bVal ? -1 * modifier : aVal > bVal ? 1 * modifier : 0
      })
    : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column: string) => {
    setSortConfig(current => ({
      column,
      direction: current?.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const toggleRowSelection = (id: string) => {
    setSelectedCategories(current => 
      current.includes(id) 
        ? current.filter(rowId => rowId !== id)
        : [...current, id]
    )
  }

  const toggleAllRows = () => {
    setSelectedCategories(current => 
      current.length === paginatedData.length 
        ? [] 
        : paginatedData.map(item => item.id)
    )
  }

  return (
    <div className="space-y-4">
      <ProductsToolbar groups={toolbarGroups} />
      
      <div className="space-y-4">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-b border-zinc-800">
          <Table className="border-none">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[40px] h-12">
                  <Checkbox 
                    checked={selectedCategories.length === paginatedData.length}
                    onCheckedChange={toggleAllRows}
                  />
                </TableHead>
                {visibleColumns.map((column) => {
                  const col = columns.find(c => c.id === column)
                  const Icon = col?.icon
                  const isSorted = sortConfig?.column === column
                  const sortDir = sortConfig?.direction
                  
                  return (
                    <TableHead 
                      key={column} 
                      className="h-12 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{col?.label}</span>
                        <div className="w-4">
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-30" />
                          )}
                        </div>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  className={`hover:bg-muted/50 ${
                    selectedCategories.includes(item.id) ? 'bg-muted/40' : ''
                  }`}
                  onClick={() => toggleRowSelection(item.id)}
                  onDoubleClick={() => {
                    if (selectedCategories.length === 1) {
                      const categoryToEdit = categories.find(c => c.id === selectedCategories[0])
                      if (categoryToEdit) {
                        setEditingCategory(categoryToEdit)
                        setIsEditCategoryPopupOpen(true)
                      }
                    }
                  }}
                >
                  <TableCell className="h-[50px] py-3">
                    <Checkbox 
                      checked={selectedCategories.includes(item.id)}
                      onCheckedChange={() => toggleRowSelection(item.id)}
                    />
                  </TableCell>
                  {visibleColumns.map((column) => (
                    <TableCell key={column} className="h-[50px] py-3">
                      {column === 'name' && (
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-400" />
                          {item.name}
                        </div>
                      )}
                      {column === 'products' && (
                        <Badge variant="outline">
                          {item.products}
                        </Badge>
                      )}
                      {column === 'description' && item.description}
                      {column === 'parent' && (
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-muted-foreground" />
                          {item.parent}
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Show</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-zinc-500">entries</span>
            </div>
            <div className="text-sm text-zinc-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="hidden md:inline-flex"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <EditCategoryPopup
            open={isEditCategoryPopupOpen}
            onOpenChange={setIsEditCategoryPopupOpen}
            category={editingCategory!}
            onCategoryUpdated={(updatedCategory) => {
              const index = categories.findIndex(c => c.id === updatedCategory.id)
              if (index !== -1) {
                categories[index] = updatedCategory
              }
            }}
          />
          <DeleteCategoryPopup
            open={isDeleteCategoryPopupOpen}
            onOpenChange={setIsDeleteCategoryPopupOpen}
            selectedCount={selectedCategories.length}
            onConfirm={() => {
              const remainingCategories = categories.filter(
                c => !selectedCategories.includes(c.id)
              )
              categories.length = 0
              categories.push(...remainingCategories)
              setSelectedCategories([])
              toast({
                title: "Categories deleted",
                description: `${selectedCategories.length} ${selectedCategories.length === 1 ? 'category has' : 'categories have'} been removed.`
              })
            }}
          />
          <AddCategoryPopup
            open={isAddCategoryPopupOpen}
            onOpenChange={setIsAddCategoryPopupOpen}
            onCategoryAdded={(newCategory) => {
              const category = {
                id: (categories.length + 1).toString(),
                name: newCategory.name,
                products: 0,
                description: newCategory.description,
                parent: newCategory.parentCategory || "Uncategorized"
              }
              categories.push(category)
            }}
          />
        </div>
      </div>
    </div>
  )
}
