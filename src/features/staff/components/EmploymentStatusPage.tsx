import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, Loader2, Pencil, Trash2 } from "lucide-react"
import { useEmploymentStatuses } from "../hooks/useEmploymentStatuses"
import { EmploymentStatusModal } from "./EmploymentStatusModal"
import type { EmploymentStatus } from "../types/employmentStatus"

export function EmploymentStatusPage() {
  const { statuses, isLoading, isError, loadStatuses, addStatus, updateStatus, deleteStatus } = useEmploymentStatuses()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | undefined>()
  const [isReadOnly, setIsReadOnly] = useState(false)
  const { toast } = useToast()

  const handleAddStatus = () => {
    setSelectedStatus(undefined)
    setIsReadOnly(false)
    setIsModalOpen(true)
  }

  const handleEditStatus = (status: EmploymentStatus) => {
    setSelectedStatus(status)
    setIsReadOnly(false)
    setIsModalOpen(true)
  }

  const handleViewStatus = (status: EmploymentStatus) => {
    setSelectedStatus(status)
    setIsReadOnly(true)
    setIsModalOpen(true)
  }

  const handleDeleteStatus = async (status: EmploymentStatus) => {
    try {
      await deleteStatus(status.id!)
      toast({
        title: "Status Deleted",
        description: `Employment status "${status.name}" was successfully deleted`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employment status",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (data: EmploymentStatus) => {
    try {
      if (selectedStatus) {
        await updateStatus(selectedStatus.id!, data)
      } else {
        await addStatus(data)
      }
    } catch (error) {
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Briefcase className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive">Failed to load employment statuses</h3>
        <p className="text-sm text-muted-foreground mb-4">Please try again later</p>
        <Button
          variant="outline"
          onClick={() => loadStatuses()}
        >
          <Loader2 className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employment Statuses</h1>
            <p className="text-muted-foreground">Manage employment statuses and their benefits</p>
          </div>
          <Button onClick={handleAddStatus}>
            <Plus className="h-4 w-4 mr-2" />
            Add Status
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statuses.map((status) => (
            <Card key={status.id} className="group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span>{status.name}</span>
                  </div>
                </CardTitle>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewStatus(status)}
                  >
                    <Briefcase className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditStatus(status)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteStatus(status)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  {status.description}
                </CardDescription>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {status.benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Staff Count</span>
                    <Badge variant="outline">{status.staffCount || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <EmploymentStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedStatus}
        isReadOnly={isReadOnly}
      />
    </>
  )
}
