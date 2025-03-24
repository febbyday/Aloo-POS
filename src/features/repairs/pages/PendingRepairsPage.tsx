import { useState } from 'react'
import { Repair, RepairStatus } from '../types'
import { RepairsTable } from '../components/RepairsTable'
import { RepairTicketModal } from '../components/RepairTicketModal'
import { RepairDetailsView } from '../components/RepairDetailsView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Plus, Search } from 'lucide-react'

export function PendingRepairsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsViewOpen, setIsDetailsViewOpen] = useState(false)

  // TODO: Replace with actual data fetching
  const repairs: Repair[] = []

  const pendingRepairs = repairs.filter(repair => 
    repair.status === RepairStatus.PENDING || 
    repair.status === RepairStatus.IN_PROGRESS || 
    repair.status === RepairStatus.WAITING_PARTS
  )

  const filteredRepairs = pendingRepairs.filter(repair =>
    repair.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repair.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repair.productType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateRepair = (data: Repair) => {
    // TODO: Implement repair creation
    console.log('Creating repair:', data)
    setIsCreateModalOpen(false)
  }

  const handleViewRepair = (repair: Repair) => {
    setSelectedRepair(repair)
    setIsDetailsViewOpen(true)
  }

  const handleEditRepair = (repair: Repair) => {
    // TODO: Implement repair editing
    console.log('Editing repair:', repair)
  }

  const handleDeleteRepair = (repair: Repair) => {
    // TODO: Implement repair deletion
    console.log('Deleting repair:', repair)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pending Repairs</h1>
          <p className="text-muted-foreground">
            View and manage repairs that require attention
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Repair
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">
              {pendingRepairs.filter(r => r.status === RepairStatus.PENDING).length}
            </span>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">
              {pendingRepairs.filter(r => r.status === RepairStatus.IN_PROGRESS).length}
            </span>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Waiting for Parts</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">
              {pendingRepairs.filter(r => r.status === RepairStatus.WAITING_PARTS).length}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repairs by ticket #, customer, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Repairs Table */}
      <RepairsTable
        repairs={filteredRepairs}
        onView={handleViewRepair}
        onEdit={handleEditRepair}
        onDelete={handleDeleteRepair}
        selectedRepairs={selectedRepairs}
        onSelectedRepairsChange={setSelectedRepairs}
        onSort={(column) => console.log('Sorting by', column)}
      />

      {/* Create Modal */}
      <RepairTicketModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateRepair}
        technicians={[]} // TODO: Add actual technicians list
      />

      {/* Details View */}
      {selectedRepair && (
        <RepairDetailsView
          open={isDetailsViewOpen}
          onOpenChange={setIsDetailsViewOpen}
          repair={selectedRepair}
          onAddWorkLog={() => {}} // TODO: Implement
          onAddItem={() => {}} // TODO: Implement
        />
      )}
    </div>
  )
}
