import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus,
  Wrench,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react"
import { RepairsTable } from '../components/RepairsTable'
import { RepairTicketModal } from '../components/RepairTicketModal'
import { RepairDetailsView } from '../components/RepairDetailsView'
import { RepairsToolbar } from '../components/RepairsToolbar'
import { Repair, RepairStatus, RepairPriority, RepairIssueType, LeatherProductType } from '../types'

// Mock data for initial development
export const mockRepairs: Repair[] = [
  {
    id: "1",
    ticketNumber: "REP-2024-001",
    customerName: "John Doe",
    customerPhone: "+1 234-567-8901",
    customerEmail: "john@example.com",
    productName: "Audio Interface",
    productBrand: "FocusRite",
    productModel: "Scarlett 2i2",
    productSerial: "SC234567",
    productColor: "Red",
    productType: LeatherProductType.OTHER,
    issueType: RepairIssueType.OTHER,
    issueDescription: "No sound output from left channel",
    priority: RepairPriority.HIGH,
    status: RepairStatus.IN_PROGRESS,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
    estimatedCompletionDate: new Date("2024-02-25"),
    estimatedCost: 150,
    depositAmount: 50,
    diagnostics: [
      {
        id: "d1",
        timestamp: new Date("2024-02-20"),
        technician: "Mike Wilson",
        findings: "Left channel preamp issue",
        recommendations: "Replace preamp circuit",
        estimatedCost: 100,
        estimatedDuration: 2,
      }
    ],
    workLog: [
      {
        id: "wl1",
        timestamp: new Date("2024-02-20"),
        technician: "Mike Wilson",
        description: "Initial assessment completed. Found issue with the left channel preamp circuit. Ordered replacement parts."
      },
      {
        id: "wl2",
        timestamp: new Date("2024-02-22"),
        technician: "Mike Wilson",
        description: "Replacement parts arrived. Started repair work on the preamp circuit."
      }
    ],
    items: [
      {
        id: "i1",
        type: "PART",
        name: "Preamp Circuit Board",
        description: "Replacement preamp for left channel",
        quantity: 1,
        unitPrice: 75,
        status: "ORDERED",
        estimatedArrival: new Date("2024-02-23"),
      }
    ],
  }
]

interface Metrics {
  total: number
  inProgress: number
  completed: number
  waitingParts: number
}

export function RepairsPage() {
  const [repairs] = useState<Repair[]>(mockRepairs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  const [showRepairDetails, setShowRepairDetails] = useState(false)
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([])
  const { toast } = useToast()

  const handleSearch = (query: string) => {
    setSearchTerm(query.toLowerCase())
    // Implement search logic
  }

  const handleNewRepair = () => {
    setSelectedRepair(null)
    setShowNewTicketModal(true)
  }

  const handleViewRepair = () => {
    if (selectedRepairs.length === 1) {
      const repair = repairs.find(r => r.id === selectedRepairs[0])
      if (repair) {
        setSelectedRepair(repair)
        setShowRepairDetails(true)
      }
    }
  }

  const handleEditRepair = () => {
    if (selectedRepairs.length === 1) {
      const repair = repairs.find(r => r.id === selectedRepairs[0])
      if (repair) {
        setSelectedRepair(repair)
        setShowNewTicketModal(true)
      }
    }
  }

  const handleDeleteRepair = () => {
    if (selectedRepairs.length === 1) {
      const repair = repairs.find(r => r.id === selectedRepairs[0])
      if (repair) {
        // Implement delete logic with confirmation
        toast({
          title: "Repair ticket deleted",
          description: `Ticket #${repair.ticketNumber} has been deleted.`,
        })
      }
    }
  }

  const handleSaveRepair = (data: any) => {
    // Implement save logic
    toast({
      title: "Repair ticket saved",
      description: "The repair ticket has been saved successfully.",
    })
    setShowNewTicketModal(false)
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshing repairs",
      description: "Fetching latest repair tickets...",
    })
  }

  const handleExport = () => {
    toast({
      title: "Exporting repairs",
      description: "Preparing repair tickets for export...",
    })
  }

  const handlePrint = () => {
    toast({
      title: "Printing repairs",
      description: "Preparing repair tickets for printing...",
    })
  }

  const handleBulkAction = (action: 'view' | 'edit' | 'status' | 'history') => {
    switch (action) {
      case 'view':
        // Implement bulk view
        break
      case 'edit':
        // Implement bulk edit
        break
      case 'status':
        // Implement bulk status change
        break
      case 'history':
        // Implement bulk history view
        break
    }
  }

  const metrics = {
    total: repairs.length,
    inProgress: repairs.filter(r => r.status === RepairStatus.IN_PROGRESS).length,
    completed: repairs.filter(r => r.status === RepairStatus.COMPLETED).length,
    waitingParts: repairs.filter(r => r.status === RepairStatus.WAITING_PARTS).length,
  }

  return (
    <div className="h-full flex-1 flex-col flex">
      <div className="space-y-4">
        <RepairsToolbar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onPrint={handlePrint}
          onExport={handleExport}
          onNewRepair={handleNewRepair}
          onViewRepair={handleViewRepair}
          onEditRepair={handleEditRepair}
          onDeleteRepair={handleDeleteRepair}
          selectedRepairs={selectedRepairs}
          onBulkAction={handleBulkAction}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Repairs
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">
                All repair tickets
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Active repairs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completed}</div>
              <p className="text-xs text-muted-foreground">
                Finished repairs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Waiting Parts
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.waitingParts}</div>
              <p className="text-xs text-muted-foreground">
                Parts on order
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <RepairsTable
            repairs={repairs}
            onView={(repair) => {
              setSelectedRepair(repair)
              setShowRepairDetails(true)
            }}
            onEdit={handleEditRepair}
            onDelete={handleDeleteRepair}
            selectedRepairs={selectedRepairs}
            onSelectedRepairsChange={setSelectedRepairs}
          />
        </div>
      </div>

      <RepairTicketModal
        open={showNewTicketModal}
        onOpenChange={setShowNewTicketModal}
        repair={selectedRepair}
        onSubmit={handleSaveRepair}
        technicians={['Mike Smith', 'Jane Doe']}
      />

      <RepairDetailsView
        open={showRepairDetails}
        onOpenChange={setShowRepairDetails}
        repair={selectedRepair}
        onAddDiagnostics={() => {}}
        onAddWorkLog={() => {}}
        onAddItem={() => {}}
      />
    </div>
  )
}
