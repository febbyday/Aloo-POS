import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { FileUp, Check, AlertTriangle } from "lucide-react"

interface ImportPricesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportPricesDialog({
  open,
  onOpenChange,
}: ImportPricesDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<string>("replace")
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "importing" | "success" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setStatus("idle")
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import")
      return
    }

    setStatus("importing")
    setProgress(0)

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("success")
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Prices</DialogTitle>
          <DialogDescription>
            Import product prices from a CSV or Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>File</Label>
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="price-file"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed"
              >
                {file ? (
                  <>
                    <FileUp className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Click to change file
                    </p>
                  </>
                ) : (
                  <>
                    <FileUp className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports CSV and Excel files
                    </p>
                  </>
                )}
              </Label>
              <Input
                id="price-file"
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Import Type</Label>
            <Select value={importType} onValueChange={setImportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">Replace All Prices</SelectItem>
                <SelectItem value="update">Update Existing Only</SelectItem>
                <SelectItem value="new">Add New Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "importing" && (
            <div className="space-y-2">
              <Label>Import Progress</Label>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                Importing... {progress}%
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">
                Import completed successfully
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || status === "importing"}
            >
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImportPricesDialog;
