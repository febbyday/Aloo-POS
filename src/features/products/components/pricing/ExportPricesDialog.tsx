import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useProducts } from "../../context/ProductContext"

interface ExportPricesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportPricesDialog({
  open,
  onOpenChange,
}: ExportPricesDialogProps) {
  const { products } = useProducts()
  const [fileName, setFileName] = useState("product-prices")
  const [fileFormat, setFileFormat] = useState("csv")
  const [selectedFields, setSelectedFields] = useState([
    "sku",
    "name",
    "price",
    "costPrice",
  ])

  const availableFields = [
    { id: "sku", label: "SKU" },
    { id: "name", label: "Product Name" },
    { id: "price", label: "Price" },
    { id: "costPrice", label: "Cost Price" },
    { id: "category", label: "Category" },
    { id: "supplier", label: "Supplier" },
    { id: "margin", label: "Margin" },
    { id: "markup", label: "Markup" },
  ]

  const handleExport = () => {
    // In a real application, this would trigger the export process
    // For now, we'll just simulate it with a console log
    console.log("Exporting prices:", {
      fileName,
      fileFormat,
      selectedFields,
      products,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Prices</DialogTitle>
          <DialogDescription>
            Export product prices to a file format of your choice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>File Name</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
            />
          </div>

          <div className="space-y-2">
            <Label>File Format</Label>
            <Select value={fileFormat} onValueChange={setFileFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fields to Export</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={(checked) => {
                      setSelectedFields(
                        checked
                          ? [...selectedFields, field.id]
                          : selectedFields.filter((id) => id !== field.id)
                      )
                    }}
                  />
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport}>Export</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ExportPricesDialog;
