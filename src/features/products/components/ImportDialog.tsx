import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileType, AlertTriangle, Download, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import * as XLSX from 'xlsx'
import { downloadTemplate, validateAndProcessImport, type ValidationError } from "../utils/importUtils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: any[]) => Promise<void>
}

export function ImportDialog({
  open,
  onOpenChange,
  onImport
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<{ total: number; valid: number; invalid: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv' // csv
    ]
    
    if (!validTypes.includes(selectedFile.type)) {
      setErrors([{ 
        row: 0, 
        field: 'file', 
        value: selectedFile.type,
        error: 'Please upload a valid Excel or CSV file'
      }])
      return
    }

    setFile(selectedFile)
    setErrors([])
    setStats(null)
    setProgress(0)
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setImporting(true)
      setErrors([])
      setProgress(0)

      const data = await new Promise<any[]>((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const wb = XLSX.read(e.target?.result, { type: 'array' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)
            resolve(data)
          } catch (error) {
            reject(new Error('Failed to parse file'))
          }
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }

        reader.readAsArrayBuffer(file)
      })

      // Validate and process the data
      const result = await validateAndProcessImport(data, (progress) => {
        setProgress(progress)
      })

      setStats(result.stats)

      if (result.errors.length > 0) {
        setErrors(result.errors)
        if (result.validData.length === 0) {
          throw new Error('No valid data to import')
        }
      }

      if (result.validData.length > 0) {
        await onImport(result.validData)
        onOpenChange(false)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      setErrors(prev => [
        ...prev,
        { 
          row: 0, 
          field: 'file', 
          value: '',
          error: error instanceof Error ? error.message : 'Failed to import file'
        }
      ])
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    downloadTemplate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file containing your product data
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-end gap-4">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Supported formats: .xlsx, .xls, .csv</p>
            <p>Required fields: name, sku, category</p>
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Processing...</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {stats && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Import Summary</AlertTitle>
              <AlertDescription>
                Total rows: {stats.total}<br />
                Valid rows: {stats.valid}<br />
                Invalid rows: {stats.invalid}
              </AlertDescription>
            </Alert>
          )}

          {errors.length > 0 && (
            <div className="space-y-2">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  Found {errors.length} error{errors.length === 1 ? '' : 's'}
                </AlertDescription>
              </Alert>
              
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-2">
                  {errors.map((error, i) => (
                    <div key={i} className="text-sm">
                      {error.row > 0 ? `Row ${error.row}: ` : ''}{error.error}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {file && !errors.length && (
            <Alert>
              <FileType className="h-4 w-4" />
              <AlertTitle>Selected File</AlertTitle>
              <AlertDescription>{file.name}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="gap-2"
          >
            {importing ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
