import { Button } from "@/components/ui/button"
import {
  Shield,
  Users,
  Loader2
} from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form } from "@/components/ui/form"
import { useRoles } from "@/features/users/hooks/useRoles"

// Define schema for staff settings
const staffSettingsSchema = z.object({
  // General Settings
  enableStaffManagement: z.boolean(),
  staffCodePrefix: z.string(),
  requireStaffLogin: z.boolean(),

  // Security Settings
  enforcePasswordPolicy: z.boolean(),
  passwordExpiryDays: z.number().min(0),
  twoFactorAuth: z.boolean(),

  // Permissions Settings
  defaultRole: z.enum(["admin", "manager", "cashier", "inventory"]),
  allowRoleCustomization: z.boolean(),

  // Schedule Settings
  enableScheduling: z.boolean(),
  defaultShiftHours: z.number().min(1).max(12),
  allowOvertime: z.boolean(),

  // Performance Settings
  enablePerformanceTracking: z.boolean(),
  salesTargets: z.boolean(),
  commissionStructure: z.boolean(),
});

type StaffSettingsValues = z.infer<typeof staffSettingsSchema>;

const defaultValues: StaffSettingsValues = {
  enableStaffManagement: true,
  staffCodePrefix: "STF",
  requireStaffLogin: true,

  enforcePasswordPolicy: true,
  passwordExpiryDays: 90,
  twoFactorAuth: false,

  defaultRole: "cashier",
  allowRoleCustomization: true,

  enableScheduling: true,
  defaultShiftHours: 8,
  allowOvertime: true,

  enablePerformanceTracking: true,
  salesTargets: true,
  commissionStructure: true,
};

/**
 * Staff Settings Component
 * Manages settings related to staff management, permissions, scheduling, and performance tracking
 */
const StaffSettings = () => {
  const { toast } = useToast();
  const { roles, isLoading: isLoadingRoles, error: rolesError } = useRoles();
  const form = useForm<StaffSettingsValues>({
    resolver: zodResolver(staffSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: StaffSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Staff settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Staff Settings</h1>
        <p className="text-muted-foreground">Configure staff management and permissions</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic staff settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-staff">Enable Staff Management</Label>
                <Switch
                  id="enable-staff"
                  checked={form.watch("enableStaffManagement")}
                  onCheckedChange={(value) => form.setValue("enableStaffManagement", value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-prefix">Staff Code Prefix</Label>
                <Input
                  id="staff-prefix"
                  {...form.register("staffCodePrefix")}
                  placeholder="STF"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-login">Require Staff Login</Label>
                <Switch
                  id="require-login"
                  checked={form.watch("requireStaffLogin")}
                  onCheckedChange={(value) => form.setValue("requireStaffLogin", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure staff security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-policy">Enforce Password Policy</Label>
                <Switch
                  id="password-policy"
                  checked={form.watch("enforcePasswordPolicy")}
                  onCheckedChange={(value) => form.setValue("enforcePasswordPolicy", value)}
                />
              </div>
              {form.watch("enforcePasswordPolicy") && (
                <div className="space-y-2">
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    {...form.register("passwordExpiryDays", { valueAsNumber: true })}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                <Switch
                  id="two-factor"
                  checked={form.watch("twoFactorAuth")}
                  onCheckedChange={(value) => form.setValue("twoFactorAuth", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Permissions Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions Settings</CardTitle>
              <CardDescription>Configure staff permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-role">Default Role</Label>
                <Select
                  defaultValue={form.watch("defaultRole")}
                  onValueChange={(value: any) => form.setValue("defaultRole", value)}
                >
                  <SelectTrigger id="default-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoles ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading roles...</span>
                      </div>
                    ) : rolesError ? (
                      <div className="text-destructive py-2 px-2 text-center">
                        <p>Error loading roles</p>
                      </div>
                    ) : roles.length === 0 ? (
                      <div className="text-muted-foreground py-2 px-2 text-center">
                        <p>No roles available</p>
                      </div>
                    ) : (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="role-customization">Allow Role Customization</Label>
                <Switch
                  id="role-customization"
                  checked={form.watch("allowRoleCustomization")}
                  onCheckedChange={(value) => form.setValue("allowRoleCustomization", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
              <CardDescription>Configure staff scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-scheduling">Enable Staff Scheduling</Label>
                <Switch
                  id="enable-scheduling"
                  checked={form.watch("enableScheduling")}
                  onCheckedChange={(value) => form.setValue("enableScheduling", value)}
                />
              </div>
              {form.watch("enableScheduling") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shift-hours">Default Shift Hours</Label>
                    <Input
                      id="shift-hours"
                      type="number"
                      {...form.register("defaultShiftHours", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-overtime">Allow Overtime</Label>
                    <Switch
                      id="allow-overtime"
                      checked={form.watch("allowOvertime")}
                      onCheckedChange={(value) => form.setValue("allowOvertime", value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>Configure staff performance tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-performance">Enable Performance Tracking</Label>
                <Switch
                  id="enable-performance"
                  checked={form.watch("enablePerformanceTracking")}
                  onCheckedChange={(value) => form.setValue("enablePerformanceTracking", value)}
                />
              </div>
              {form.watch("enablePerformanceTracking") && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sales-targets">Enable Sales Targets</Label>
                    <Switch
                      id="sales-targets"
                      checked={form.watch("salesTargets")}
                      onCheckedChange={(value) => form.setValue("salesTargets", value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="commission">Enable Commission Structure</Label>
                    <Switch
                      id="commission"
                      checked={form.watch("commissionStructure")}
                      onCheckedChange={(value) => form.setValue("commissionStructure", value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={() => form.reset(defaultValues)}>
              Reset to Defaults
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StaffSettings;