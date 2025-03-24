import { useState } from 'react'
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Pencil, 
  Users,
  Download,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export interface CustomerGroup {
  id: string
  name: string
  description: string
  memberCount: number
  discountRate: number
  createdAt: Date
}

export function CustomerGroupsPage() {
  const [groups, setGroups] = useState<CustomerGroup[]>([
    {
      id: '1',
      name: 'VIP Customers',
      description: 'Our most valuable customers',
      memberCount: 24,
      discountRate: 15,
      createdAt: new Date(2023, 5, 15)
    },
    {
      id: '2',
      name: 'Regular Customers',
      description: 'Customers who shop regularly',
      memberCount: 156,
      discountRate: 5,
      createdAt: new Date(2023, 6, 22)
    },
    {
      id: '3',
      name: 'New Customers',
      description: 'Customers who recently joined',
      memberCount: 78,
      discountRate: 10,
      createdAt: new Date(2023, 8, 10)
    }
  ])
  
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)
  const { toast } = useToast()

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your customer groups are being updated."
    })
  }

  const handleCreateGroup = () => {
    setEditingGroup(null)
    setDialogOpen(true)
  }

  const handleEditGroup = (group: CustomerGroup) => {
    setEditingGroup(group)
    setDialogOpen(true)
  }

  const handleDeleteGroups = () => {
    setGroups(groups.filter(group => !selectedGroups.includes(group.id)))
    setSelectedGroups([])
    toast({
      title: "Groups Deleted",
      description: `${selectedGroups.length} group(s) have been deleted.`
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(filteredGroups.map(group => group.id))
    } else {
      setSelectedGroups([])
    }
  }

  const handleSelectGroup = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups([...selectedGroups, groupId])
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId))
    }
  }

  const handleSaveGroup = (formData: FormData) => {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const discountRate = parseFloat(formData.get('discountRate') as string)

    if (editingGroup) {
      // Update existing group
      setGroups(groups.map(group => 
        group.id === editingGroup.id 
          ? { ...group, name, description, discountRate } 
          : group
      ))
      toast({
        title: "Group Updated",
        description: `${name} has been updated successfully.`
      })
    } else {
      // Create new group
      const newGroup: CustomerGroup = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        description,
        memberCount: 0,
        discountRate,
        createdAt: new Date()
      }
      setGroups([...groups, newGroup])
      toast({
        title: "Group Created",
        description: `${name} has been created successfully.`
      })
    }
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleCreateGroup}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteGroups}
            disabled={selectedGroups.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Groups Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all groups"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No customer groups found
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups.map(group => (
                <TableRow key={group.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={(checked) => handleSelectGroup(group.id, !!checked)}
                      aria-label={`Select ${group.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{group.description}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {group.memberCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{group.discountRate}%</TableCell>
                  <TableCell className="hidden md:table-cell">{group.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditGroup(group)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Group Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Customer Group' : 'Create Customer Group'}</DialogTitle>
            <DialogDescription>
              {editingGroup 
                ? 'Update the details for this customer group' 
                : 'Create a new group to organize your customers'}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSaveGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={editingGroup?.name || ''} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                defaultValue={editingGroup?.description || ''} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountRate">Discount Rate (%)</Label>
              <Input 
                id="discountRate" 
                name="discountRate" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                defaultValue={editingGroup?.discountRate.toString() || '0'} 
                required 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGroup ? 'Save Changes' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
