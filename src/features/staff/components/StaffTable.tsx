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
import { Staff } from "../types/staff.types"
import { StaffModal } from "./StaffModal"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface StaffTableProps {
  data: Staff[]
  searchQuery?: string
  onEdit: (staff: Staff) => void
  onDelete: (staffId: string) => void
  onSelectionChange?: (selectedIds: string[]) => void
}

export function StaffTable({ data, searchQuery, onEdit, onDelete, onSelectionChange }: StaffTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleEdit = (staff: Staff) => {
    onEdit(staff)
  }

  const handleView = (staff: Staff) => {
    setActiveRowId(staff.id)
    
    toast({
      title: "Opening Staff Details",
      description: `Viewing details for ${staff.firstName} ${staff.lastName}`,
    })
    
    setTimeout(() => {
      navigate(`/staff/${staff.id}`)
    }, 300)
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
                  selectedRows.includes(staff.id!) ? "bg-muted/60" : "hover:bg-muted/30",
                  activeRowId === staff.id && "bg-primary/10 border-primary/30 border"
                )}
                onClick={() => handleRowClick(staff)}
                onDoubleClick={() => handleView(staff)}
                title="Double-click to view staff details"
              >
                <TableCell className="py-2">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {staff.firstName} {staff.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {staff.role?.name || "No role assigned"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="space-y-1">
                    <p className="text-sm">{staff.email}</p>
                    <p className="text-sm text-muted-foreground">{staff.phone || "No phone"}</p>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{staff.code || "No position"}</p>
                    <p className="text-xs text-muted-foreground">
                      {staff.updatedAt ? `Updated: ${new Date(staff.updatedAt).toLocaleDateString()}` : "Not updated"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  {typeof staff.employmentType === 'object' && staff.employmentType && 'name' in staff.employmentType ? (
                    <Badge 
                      className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-500/10"
                      style={{ 
                        backgroundColor: `${staff.employmentType.color}20`,
                        color: staff.employmentType.color,
                        borderColor: `${staff.employmentType.color}10` 
                      }}
                    >
                      {staff.employmentType.name}
                    </Badge>
                  ) : typeof staff.employmentType === 'string' ? (
                    <Badge className={
                      staff.employmentType === "full-time" ? "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-500/10" :
                      staff.employmentType === "part-time" ? "bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 border-purple-500/10" :
                      "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30 border-orange-500/10"
                    }>
                      {staff.employmentType}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 border-gray-500/10">
                      Not specified
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  {typeof staff.status === 'string' ? (
                    <Badge className={
                      staff.status.toLowerCase() === "active" ? "bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/10" :
                      "bg-red-500/20 text-red-700 hover:bg-red-500/30 border-red-500/10"
                    }>
                      {staff.status}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 border-gray-500/10">
                      Unknown
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground text-center italic">
          <p>Tip: Click to select a staff member. Double-click to view their full details.</p>
        </div>
      )}
    </>
  )
}
