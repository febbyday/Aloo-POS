import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCategories } from '../context/CategoryContext'
import { Trash, Power, FolderSymlink, Tags } from 'lucide-react'
import { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export function CategoryBulkActions() {
  const { selectedCategories, bulkAction } = useCategories()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    await bulkAction({
      type: 'delete',
      ids: selectedCategories,
      value: null
    })
    setShowDeleteDialog(false)
  }

  const handleStatusChange = async (status: 'active' | 'inactive') => {
    await bulkAction({
      type: 'status',
      ids: selectedCategories,
      value: status
    })
  }

  if (selectedCategories.length === 0) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Bulk Actions ({selectedCategories.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusChange('active')}>
            <Power className="mr-2 h-4 w-4" /> Set Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('inactive')}>
            <Power className="mr-2 h-4 w-4" /> Set Inactive
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FolderSymlink className="mr-2 h-4 w-4" /> Move Categories
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Tags className="mr-2 h-4 w-4" /> Manage Attributes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Categories</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCategories.length} categories?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}