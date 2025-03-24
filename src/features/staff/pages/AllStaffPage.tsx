import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { StaffToolbar } from "../components/StaffToolbar"
import { Search, Plus, Download, Upload, Pencil, Trash2, Eye, UserCheck, UserX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StaffTable } from "../components/StaffTable"
import { Staff } from "../types/staff"
import { useToast } from "@/components/ui/use-toast"
import { StaffModal } from "../components/StaffModal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { staffService } from "../services/staffService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AllStaffPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)
  const [staffData, setStaffData] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // Fetch staff data on component mount
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setIsLoading(true)
        const data = await staffService.getAllStaff()
        setStaffData(data)
        setError(null)
      } catch (err) {
        setError("Failed to load staff data. Please try again later.")
        console.error("Error fetching staff data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaffData()
  }, [])

  const handleAddStaff = () => {
    setIsAddModalOpen(true)
  }

  const handleCreateStaff = async (newStaff: Omit<Staff, "id">) => {
    try {
      const createdStaff = await staffService.createStaff(newStaff)
      setStaffData([...staffData, createdStaff])
      toast({
        title: "Staff Added",
        description: `${newStaff.firstName} ${newStaff.lastName} has been added to the staff list.`,
      })
      setIsAddModalOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add new staff member. Please try again.",
        variant: "destructive",
      })
      console.error("Error creating staff:", err)
    }
  }

  const handleEditStaff = async (updatedStaff: Staff) => {
    try {
      const result = await staffService.updateStaff(updatedStaff.id, updatedStaff)
      setStaffData(staffData.map(staff => 
        staff.id === result.id ? result : staff
      ))
      toast({
        title: "Staff Updated",
        description: `${result.firstName} ${result.lastName}'s information has been updated.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      })
      console.error("Error updating staff:", err)
    }
  }

  const handleDeleteStaff = (staffId: string) => {
    const staffToRemove = staffData.find(staff => staff.id === staffId)
    if (staffToRemove) {
      setStaffToDelete(staffToRemove)
    }
  }

  const handleViewStaff = () => {
    if (selectedStaff.length === 1) {
      const staffMember = staffData.find(staff => staff.id === selectedStaff[0])
      if (staffMember) {
        navigate(`/staff/${staffMember.id}`)
      }
    }
  }

  const confirmDelete = async () => {
    if (staffToDelete) {
      try {
        await staffService.deleteStaff(staffToDelete.id)
        setStaffData(staffData.filter(staff => staff.id !== staffToDelete.id))
        toast({
          title: "Staff Deleted",
          description: `${staffToDelete.firstName} ${staffToDelete.lastName} has been removed from the system.`,
          variant: "destructive",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete staff member. Please try again.",
          variant: "destructive",
        })
        console.error("Error deleting staff:", err)
      } finally {
        setStaffToDelete(null)
      }
    }
  }

  const cancelDelete = () => {
    setStaffToDelete(null)
  }

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: Plus,
          label: "Add Staff",
          onClick: handleAddStaff
        },
        {
          icon: Pencil,
          label: "Edit Staff",
          onClick: () => {
            if (selectedStaff.length === 1) {
              const staffToEdit = staffData.find(staff => staff.id === selectedStaff[0]);
              if (staffToEdit) {
                navigate(`/staff/edit/${staffToEdit.id}`);
              }
            }
          },
          disabled: selectedStaff.length !== 1
        }
      ]
    },
    {
      buttons: [
        {
          icon: Eye,
          label: "View Details",
          onClick: handleViewStaff,
          disabled: selectedStaff.length !== 1
        },
        {
          icon: Trash2,
          label: "Delete Staff",
          onClick: () => {
            if (selectedStaff.length === 1) {
              handleDeleteStaff(selectedStaff[0]);
            }
          },
          disabled: selectedStaff.length !== 1
        },
        {
          icon: Download,
          label: "Export",
          onClick: () => console.log("Export staff clicked"),
          disabled: selectedStaff.length === 0
        },
        {
          icon: Upload,
          label: "Import",
          onClick: () => console.log("Import staff clicked")
        },
        {
          icon: UserCheck,
          label: "Activate",
          onClick: () => console.log("Activate staff clicked"),
          disabled: selectedStaff.length === 0
        },
        {
          icon: UserX,
          label: "Deactivate",
          onClick: () => console.log("Deactivate staff clicked"),
          disabled: selectedStaff.length === 0
        }
      ]
    }
  ]

  return (
    <div className="w-full space-y-6">
      {staffService.isUsingMockData() && (
        <Alert className="bg-amber-50 border-amber-300">
          <AlertTitle className="text-amber-700">
            Using Mock Data (Backend Setup In Progress)
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            The system is currently using mock data while the backend is being set up. 
            Changes you make will be temporarily stored in memory. Follow the setup instructions in
            <code className="mx-1 p-1 bg-amber-100 rounded">BACKEND_STARTUP.md</code> 
            to connect to the database for persistent storage.
          </AlertDescription>
        </Alert>
      )}

      <StaffToolbar 
        groups={toolbarGroups}
        rightContent={
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full max-w-md"
            />
          </div>
        }
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Loading staff data...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <StaffTable 
          data={staffData}
          searchQuery={searchQuery}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
          onSelectionChange={setSelectedStaff}
        />
      )}

      {/* Add Staff Modal */}
      <StaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateStaff}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {staffToDelete?.firstName} {staffToDelete?.lastName}'s 
              record and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
