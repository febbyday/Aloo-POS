import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CommissionForm } from "./CommissionForm"
import { toast } from "sonner"
import { Commission } from "../types"

interface CommissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Commission
  onSave: (data: Commission) => void
}

export function CommissionModal({
  open,
  onOpenChange,
  initialData,
  onSave,
}: CommissionModalProps) {
  const handleSubmit = async (data: Commission) => {
    try {
      onSave(data)
      toast.success(initialData ? "Commission updated successfully" : "Commission added successfully")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save commission")
      console.error("Error saving commission:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Commission" : "Add Commission"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the commission settings for this supplier"
              : "Configure commission settings for this supplier"}
          </DialogDescription>
        </DialogHeader>
        <CommissionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
} 