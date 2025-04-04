import { useState } from "react"
import { Save, Loader2, Shield, User, Printer, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserPermissionsProps {
  onSave: (permissions: UserPermission[]) => void
}

interface UserPermission {
  id: string
  name: string
  role: string
  canDesign: boolean
  canPrint: boolean
  canManageSettings: boolean
  canManageTemplates: boolean
  canViewHistory: boolean
  canExport: boolean
}

// Mock data - replace with real data from your backend
const defaultPermissions: UserPermission[] = [
  {
    id: "1",
    name: "Admin",
    role: "Administrator",
    canDesign: true,
    canPrint: true,
    canManageSettings: true,
    canManageTemplates: true,
    canViewHistory: true,
    canExport: true,
  },
  {
    id: "2",
    name: "Manager",
    role: "Store Manager",
    canDesign: true,
    canPrint: true,
    canManageSettings: false,
    canManageTemplates: true,
    canViewHistory: true,
    canExport: true,
  },
  {
    id: "3",
    name: "Cashier",
    role: "Cashier",
    canDesign: false,
    canPrint: true,
    canManageSettings: false,
    canManageTemplates: false,
    canViewHistory: true,
    canExport: false,
  },
]

export function UserPermissions({ onSave }: UserPermissionsProps) {
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<UserPermission[]>(defaultPermissions)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(permissions)
      toast({
        title: "Permissions Updated",
        description: "User permissions have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user permissions.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePermissionChange = (userId: string, permission: keyof UserPermission, value: boolean) => {
    setPermissions(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, [permission]: value } : user
      )
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">User Permissions</h3>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Design</TableHead>
              <TableHead>Print</TableHead>
              <TableHead>Settings</TableHead>
              <TableHead>Templates</TableHead>
              <TableHead>History</TableHead>
              <TableHead>Export</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.canDesign}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(user.id, "canDesign", checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.canPrint}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(user.id, "canPrint", checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.canManageSettings}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(user.id, "canManageSettings", checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.canManageTemplates}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(user.id, "canManageTemplates", checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.canViewHistory}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(user.id, "canViewHistory", checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.canExport}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(user.id, "canExport", checked as boolean)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="p-4 border-t">
        <h4 className="text-sm font-medium mb-2">Permission Icons</h4>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Design Labels</span>
          </div>
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>Print Labels</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Manage Settings</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Add default export for the component
export default UserPermissions; 