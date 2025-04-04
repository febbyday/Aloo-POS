import { useState } from 'react'
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Pencil, 
  Users,
  Download,
  Upload,
  ArrowLeft,
  Tag,
  User,
  Calendar,
  MoreHorizontal,
  FileText,
  Percent,
  Info,
  Filter,
  Search
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Toolbar } from "@/components/ui/toolbar/toolbar"

export interface CustomerGroup {
  id: string
  name: string
  description: string
  memberCount: number
  discountRate: number
  createdAt: Date
}

interface ActionMenuProps {
  group: CustomerGroup;
  onEdit: (group: CustomerGroup) => void;
  onDelete: (groupId: string) => void;
}

function ActionMenu({ group, onEdit, onDelete }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-8 w-8 p-0 hover:bg-accent rounded-md">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(group)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Group
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(group.id)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GroupCard({ 
  group, 
  selected, 
  onSelect, 
  onEdit, 
  onDelete 
}: { 
  group: CustomerGroup; 
  selected: boolean; 
  onSelect: (checked: boolean) => void;
  onEdit: (group: CustomerGroup) => void;
  onDelete: (groupId: string) => void;
}) {
  // Determine color based on discount rate
  const getDiscountColor = () => {
    if (group.discountRate >= 15) return "bg-green-500";
    if (group.discountRate >= 10) return "bg-blue-500";
    if (group.discountRate >= 5) return "bg-amber-500";
    return "bg-gray-500";
  };
  
  return (
    <Card className={cn(
      "transition-all hover:shadow-md overflow-hidden relative",
      selected ? "border-primary bg-muted/50" : "border"
    )}>
      {/* Colored accent based on discount */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", getDiscountColor())} />
      
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={selected}
              onCheckedChange={onSelect}
              aria-label={`Select ${group.name}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            <div>
              <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
              <CardDescription className="line-clamp-1 mt-1 text-sm">
                {group.description || "No description"}
              </CardDescription>
            </div>
          </div>
          <ActionMenu
            group={group}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="border-t border-border pt-3 mt-1">
          {/* Discount rate visualization */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5" />
                Discount Rate
              </span>
              <span className="text-sm font-semibold">{group.discountRate}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", getDiscountColor())} 
                style={{ width: `${Math.min(100, group.discountRate * 5)}%` }}
              />
            </div>
          </div>
          
          {/* Member count and created date in a grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Users className="h-3.5 w-3.5" />
                <span>Members</span>
              </div>
              <span className="text-lg font-medium">{group.memberCount}</span>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created</span>
              </div>
              <span className="text-sm font-medium">
                {group.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId))
    setSelectedGroups(selectedGroups.filter(id => id !== groupId))
    toast({
      title: "Group Deleted",
      description: "The group has been deleted."
    })
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

  const toggleRowSelection = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId))
    } else {
      setSelectedGroups([...selectedGroups, groupId])
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

  const handleExport = () => {
    // Implement export functionality
    toast({
      title: "Exporting Data",
      description: "Customer groups are being exported."
    })
    // In a real implementation, this would generate and download a file
    console.log("Exporting customer groups:", groups);
  }

  const handleImport = () => {
    // Implement import functionality
    toast({
      title: "Import Customer Groups",
      description: "Please select a file to import customer groups."
    })
    // In a real implementation, this would open a file picker
    console.log("Import customer groups initiated");
  }

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching for:", searchQuery);
    toast({
      title: "Search",
      description: `Searching for "${searchQuery}"`
    });
  }

  const handleFilter = () => {
    // Implement filter functionality
    toast({
      title: "Filter Groups",
      description: "Filter dialog would open here"
    });
  }

  // Configure toolbar groups for the Toolbar component
  const toolbarGroups = [
    {
      buttons: [
        { 
          icon: RefreshCw, 
          label: "Refresh", 
          onClick: handleRefresh 
        },
        { 
          icon: Filter, 
          label: "Filter", 
          onClick: handleFilter 
        }
      ]
    },
    {
      buttons: [
        { 
          icon: Plus, 
          label: "New Group", 
          onClick: handleCreateGroup 
        },
        { 
          icon: Trash2, 
          label: `Delete${selectedGroups.length > 0 ? ` (${selectedGroups.length})` : ''}`, 
          onClick: handleDeleteGroups,
          disabled: selectedGroups.length === 0,
          title: selectedGroups.length > 0 ? `Delete ${selectedGroups.length} selected groups` : 'Select groups to delete'
        }
      ]
    },
    {
      buttons: [
        { 
          icon: Upload, 
          label: "Import", 
          onClick: handleImport 
        },
        { 
          icon: Download, 
          label: "Export", 
          onClick: handleExport 
        }
      ]
    }
  ]

  // Search input for the right side of the toolbar
  const rightContent = (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-[180px] bg-background"
        placeholder="Search groups..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={handleSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Toolbar - now using the Toolbar component */}
      <Toolbar 
        groups={toolbarGroups}
        rightContent={rightContent}
        variant="default"
        size="default"
      />

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-md bg-muted/20">
          <Info className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No customer groups found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {searchQuery ? `No results for "${searchQuery}"` : "Create your first customer group to get started"}
          </p>
          <Button onClick={handleCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map(group => (
            <div 
              key={group.id} 
              className="cursor-pointer" 
              onClick={() => toggleRowSelection(group.id)}
            >
              <GroupCard
                group={group}
                selected={selectedGroups.includes(group.id)}
                onSelect={(checked) => handleSelectGroup(group.id, checked)}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit Customer Group' : 'Create Customer Group'}
            </DialogTitle>
            <DialogDescription>
              {editingGroup 
                ? 'Update the details for this customer group.' 
                : 'Create a new group to organize your customers.'}
            </DialogDescription>
          </DialogHeader>
          
          <form action={handleSaveGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="VIP Customers" 
                defaultValue={editingGroup?.name || ''}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Our most valuable customers" 
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
                placeholder="10" 
                defaultValue={editingGroup?.discountRate.toString() || '0'}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">
                {editingGroup ? 'Update Group' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
