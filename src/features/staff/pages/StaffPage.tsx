import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2 } from "lucide-react"
import { StaffTable } from "../components/StaffTable"
import { StaffModal } from "../components/StaffModal"
import type { Staff } from "../types/staff"
import { staffService } from "../services/staffService"
import { useToast } from "@/components/ui/use-toast"

export function StaffPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [staffData, setStaffData] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null)
  const { toast } = useToast()

  // Fetch staff data from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true)
        const data = await staffService.fetchAll()
        setStaffData(data)
      } catch (error) {
        console.error("Error fetching staff:", error)
        toast({
          title: "Error",
          description: "Failed to load staff data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [toast])

  // Filter staff based on search query
  const filteredStaff = staffData.filter(staff => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase()
    const email = staff.email.toLowerCase()
    const role = staff.role.toLowerCase()
    const query = searchQuery.toLowerCase()

    return fullName.includes(query) || email.includes(query) || role.includes(query)
  })

  const handleAdd = async (newStaffData: Staff) => {
    try {
      setIsLoading(true)
      const createdStaff = await staffService.create(newStaffData)
      setStaffData(prev => [...prev, createdStaff])
      toast({
        title: "Staff Added",
        description: `${createdStaff.firstName} ${createdStaff.lastName} has been added successfully.`
      })
    } catch (error) {
      console.error("Error adding staff:", error)
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (staff: Staff) => {
    setStaffToEdit(staff)
  }

  const handleUpdate = async (updatedStaffData: Staff) => {
    if (!staffToEdit) return

    try {
      setIsLoading(true)
      const updatedStaff = await staffService.update(staffToEdit.id, updatedStaffData)
      setStaffData(prev => prev.map(staff => 
        staff.id === updatedStaff.id ? updatedStaff : staff
      ))
      setStaffToEdit(null)
      toast({
        title: "Staff Updated",
        description: `${updatedStaff.firstName} ${updatedStaff.lastName}'s information has been updated.`
      })
    } catch (error) {
      console.error("Error updating staff:", error)
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (staffId: string) => {
    try {
      setIsLoading(true)
      const success = await staffService.delete(staffId)
      
      if (success) {
        setStaffData(prev => prev.filter(staff => staff.id !== staffId))
        toast({
          title: "Staff Deleted",
          description: "Staff member has been deleted successfully."
        })
      }
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast({
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <StaffTable
          data={filteredStaff}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add Staff Modal */}
      <StaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
      />

      {/* Edit Staff Modal */}
      {staffToEdit && (
        <StaffModal
          isOpen={!!staffToEdit}
          onClose={() => setStaffToEdit(null)}
          onSubmit={handleUpdate}
          initialData={staffToEdit}
        />
      )}
    </div>
  )
}
