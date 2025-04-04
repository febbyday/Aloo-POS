import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useStaff } from '@/features/staff/hooks/useStaff';
import { useRealShopContext } from '../context/RealShopContext';
import { Staff } from '@/features/staff/types';
import { z } from 'zod';

// Form validation schema
const formSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  role: z.string().min(1, "Role is required"),
  isPrimary: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface AddStaffDialogProps {
  shopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddStaffDialog({ shopId, open, onOpenChange, onSuccess }: AddStaffDialogProps) {
  // Get staff data
  const { items: allStaff, loading: loadingStaff } = useStaff({ autoLoad: true });
  
  // Get shop context
  const { assignStaff, isLoading, error, staffAssignments, fetchStaffAssignments } = useRealShopContext();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    staffId: '',
    role: '',
    isPrimary: false,
  });
  
  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  // Toast notifications
  const { toast } = useToast();
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        staffId: '',
        role: '',
        isPrimary: false,
      });
      setErrors({});
      
      // Load staff assignments to know who's already assigned
      fetchStaffAssignments(shopId);
    }
  }, [open, shopId, fetchStaffAssignments]);
  
  // Handle form input changes
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof FormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await assignStaff(
        shopId,
        formData.staffId,
        formData.role,
        formData.isPrimary
      );
      
      toast({
        title: "Staff Assigned",
        description: "Staff member has been successfully assigned to this shop.",
      });
      
      // Close dialog and refresh data
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast({
        title: "Error",
        description: "Failed to assign staff member. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter out staff that are already assigned to this shop
  const availableStaff = allStaff.filter(staff => 
    !staffAssignments.some(assignment => assignment.staffId === staff.id)
  );
  
  // Common role options for staff in shops
  const roleOptions = [
    { value: "Manager", label: "Manager" },
    { value: "Assistant Manager", label: "Assistant Manager" },
    { value: "Supervisor", label: "Supervisor" },
    { value: "Sales Associate", label: "Sales Associate" },
    { value: "Cashier", label: "Cashier" },
    { value: "Inventory Specialist", label: "Inventory Specialist" },
    { value: "Customer Service", label: "Customer Service" },
    { value: "Maintenance", label: "Maintenance" },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Staff Member</DialogTitle>
          <DialogDescription>
            Assign a staff member to this shop location.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="staff" className="required">
              Staff Member
            </Label>
            <Select
              value={formData.staffId}
              onValueChange={(value) => handleChange('staffId', value)}
              disabled={isLoading || loadingStaff}
            >
              <SelectTrigger id="staff" className={errors.staffId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {loadingStaff ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading staff...
                  </div>
                ) : availableStaff.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    No available staff members
                  </div>
                ) : (
                  availableStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.staffId && (
              <p className="text-sm text-destructive">{errors.staffId}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role" className="required">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="role" className={errors.role ? "border-destructive" : ""}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) => handleChange('isPrimary', checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="isPrimary" className="cursor-pointer">
              This is their primary location
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || loadingStaff}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Staff"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddStaffDialog;
