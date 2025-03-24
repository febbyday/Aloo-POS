import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, FileDown, Table2 } from "lucide-react"
import { motion } from "framer-motion"
import type { Product } from "../types"

type ExportFormat = 'csv' | 'excel' | 'pdf'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: ExportFormat) => void
}

export function ExportDialog({
  open,
  onOpenChange,
  onExport
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')

  const handleExport = async () => {
    if (!selectedFormat) return

    try {
      await onExport(selectedFormat)
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const formats: Array<{
    id: ExportFormat
    label: string
    icon: React.ElementType
    description: string
  }> = [
    {
      id: 'csv',
      label: 'CSV',
      icon: Table2,
      description: 'Export as comma-separated values'
    },
    {
      id: 'excel',
      label: 'Excel',
      icon: FileDown,
      description: 'Export as Excel spreadsheet'
    },
    {
      id: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Export as PDF document'
    }
  ]

  const selectedFormatInfo = formats.find(f => f.id === selectedFormat)
  const Icon = selectedFormatInfo?.icon || FileDown

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Products</DialogTitle>
          <DialogDescription>
            Choose a format to export your data
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            {formats.map(format => {
              const Icon = format.icon
              return (
                <motion.div
                  key={format.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    variant={selectedFormat === format.id ? "default" : "outline"}
                    className="w-full h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{format.label}</span>
                  </Button>
                </motion.div>
              )
            })}
          </div>
          <DialogDescription className="text-center">
            {selectedFormatInfo?.description}
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
