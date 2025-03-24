import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AttendanceRecord } from "../types/attendance"
import { useToast } from "@/components/ui/use-toast"
import { addNoteToAttendanceRecord } from "../services/attendanceService"

interface AttendanceNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export function AttendanceNotesModal({ 
  isOpen, 
  onClose, 
  record
}: AttendanceNotesModalProps) {
  const [notes, setNotes] = useState<string>("")
  const { toast } = useToast()
  
  useEffect(() => {
    if (record) {
      setNotes(record.notes || "");
    }
  }, [record]);
  
  const handleSave = () => {
    if (!record) return;
    
    try {
      const updatedRecord = addNoteToAttendanceRecord(record.id, notes);
      
      toast({
        title: "Success",
        description: "Note added successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attendance Notes</DialogTitle>
          <DialogDescription>
            Add or update notes for this attendance record.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Add notes about this attendance record"
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
