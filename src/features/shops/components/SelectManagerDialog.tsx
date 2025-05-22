import { useState } from "react";
import { useStaff } from "@/features/staff/hooks/useStaff";
import { Staff } from "@/features/staff/types/staff.types";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SelectManagerDialogProps {
  shopId: string;
  currentManagerId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManagerSelected: (staffId: string) => Promise<void>;
}

export function SelectManagerDialog({
  shopId,
  currentManagerId,
  open,
  onOpenChange,
  onManagerSelected,
}: SelectManagerDialogProps) {
  const { items: staffList, loading: loadingStaff } = useStaff({
    autoLoad: true,
    initialPageSize: 100, // Load a larger number of staff to choose from
  });
  
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentManagerId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter staff to only show active staff members
  const availableStaff = staffList.filter(staff => 
    staff.status === "ACTIVE"
  );

  const handleSubmit = async () => {
    if (!selectedStaffId) {
      toast({
        title: "Selection Required",
        description: "Please select a staff member to assign as manager.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onManagerSelected(selectedStaffId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning manager:", error);
      toast({
        title: "Error",
        description: "Failed to assign manager. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveManager = async () => {
    setIsSubmitting(true);
    try {
      await onManagerSelected(""); // Empty string to remove manager
      onOpenChange(false);
    } catch (error) {
      console.error("Error removing manager:", error);
      toast({
        title: "Error",
        description: "Failed to remove manager. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Shop Manager</DialogTitle>
          <DialogDescription>
            Choose a staff member to be the manager for this shop.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="manager">Manager</Label>
            <Select
              value={selectedStaffId}
              onValueChange={setSelectedStaffId}
              disabled={isSubmitting || loadingStaff}
            >
              <SelectTrigger id="manager">
                <SelectValue placeholder="Select a manager">
                  {loadingStaff ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading staff...</span>
                    </div>
                  ) : selectedStaffId ? (
                    (() => {
                      const staff = staffList.find(s => s.id === selectedStaffId);
                      return staff ? 
                        `${staff.firstName} ${staff.lastName}${staff.role ? ` (${staff.role.name})` : ''}` : 
                        "Select a manager";
                    })()
                  ) : (
                    "Select a manager"
                  )}
                </SelectValue>
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
                      <div className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        {staff.firstName} {staff.lastName}
                        {staff.role && ` (${staff.role.name})`}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {currentManagerId && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveManager}
              disabled={isSubmitting}
            >
              Remove Manager
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStaffId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
