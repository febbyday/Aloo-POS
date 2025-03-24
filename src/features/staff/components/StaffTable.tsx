import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  UserCircle, 
  Mail, 
  Phone, 
  BadgeCheck, 
  Calendar,
} from "lucide-react"
import { Staff } from "../types/staff"
import { StaffModal } from "./StaffModal"
import { cn } from "@/lib/utils"

interface StaffTableProps {
  data: Staff[]
  searchQuery?: string
  onEdit: (staff: Staff) => void
  onDelete: (staffId: string) => void
  onSelectionChange?: (selectedIds: string[]) => void
}

export function StaffTable({ data, searchQuery, onEdit, onDelete, onSelectionChange }: StaffTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const navigate = useNavigate()

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff)
    setViewModalOpen(true)
  }

  const handleView = (staff: Staff) => {
    navigate(`/staff/${staff.id}`)
  }

  const handleUpdate = (updatedStaff: Staff) => {
    onEdit(updatedStaff)
    setViewModalOpen(false)
    setSelectedStaff(null)
  }

  const handleRowClick = (staff: Staff) => {
    const staffId = staff.id!
    let newSelectedRows: string[]
    
    if (selectedRows.includes(staffId)) {
      newSelectedRows = selectedRows.filter(id => id !== staffId)
    } else {
      newSelectedRows = [...selectedRows, staffId]
    }
    
    setSelectedRows(newSelectedRows)
    if (onSelectionChange) {
      onSelectionChange(newSelectedRows)
    }
  }

  return (
    <>
      <div className="w-full overflow-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead>
                <div className="flex items-center space-x-1">
                  <UserCircle className="h-4 w-4" />
                  <span>Staff</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>Contact</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>Position</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <BadgeCheck className="h-4 w-4" />
                  <span>Employment</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Status</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((staff) => (
              <TableRow 
                key={staff.id}
                className={cn(
                  "py-2 cursor-pointer transition-colors",
                  selectedRows.includes(staff.id!) ? "bg-muted/60" : "hover:bg-muted/30"
                )}
                onClick={() => handleRowClick(staff)}
                onDoubleClick={() => handleView(staff)}
              >
                <TableCell className="py-2">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {staff.firstName} {staff.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {staff.department}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="space-y-1">
                    <p className="text-sm">{staff.email}</p>
                    <p className="text-sm text-muted-foreground">{staff.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{staff.position}</p>
                    <p className="text-xs text-muted-foreground">
                      Since {new Date(staff.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  {staff.employmentType === "full-time" ? (
                    <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-500/10">
                      {staff.employmentType.replace("-", " ")}
                    </Badge>
                  ) : staff.employmentType === "part-time" ? (
                    <Badge className="bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 border-purple-500/10">
                      {staff.employmentType.replace("-", " ")}
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500/20 text-orange-700 hover:bg-orange-500/30 border-orange-500/10">
                      {staff.employmentType.replace("-", " ")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  {staff.status === "active" ? (
                    <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/10">
                      {staff.status}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30 border-red-500/10">
                      {staff.status}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedStaff && (
        <StaffModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedStaff(null);
          }}
          onSubmit={handleUpdate}
          initialData={selectedStaff}
        />
      )}
    </>
  )
}
