// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useState } from "react"
import QRCode from "qrcode"
import JsBarcode from "jsbarcode"
import { jsPDF } from "jspdf"
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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { DataTable } from "@/components/ui/data-table"
import { 
  Printer, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BarcodePreview } from "./BarcodePreview"
import { validateBarcode, generateChecksum } from '../../utils/barcodeValidation'
import { printService } from '../../services/printService'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useProducts } from "../../context/ProductContext"

interface BulkBarcodeConfig {
  format: 'CODE128' | 'CODE39' | 'QR' | 'EAN13' | 'UPCA';
  startSequence: number;
  quantity: number;
  templateId: string;
  checksum: boolean;
  size: { width: number; height: number };
}

interface GeneratedBarcode {
  id: string;
  code: string;
  format: string;
  status: 'pending' | 'valid' | 'conflict';
  error?: string;
  dataUrl?: string;
}

import { ColumnDef } from "@tanstack/react-table"

const columns = (setPreviewBarcode: (barcode: GeneratedBarcode) => void): ColumnDef<GeneratedBarcode>[] => [
  {
    accessorKey: "code",
    header: "Barcode",
    cell: ({ row }: { row: { original: GeneratedBarcode } }) => {
      const barcode = row.original as GeneratedBarcode
      return (
        <div className="flex flex-col items-start gap-2">
          {barcode.dataUrl && (
            <img
              src={barcode.dataUrl}
              alt={barcode.code}
              className="max-h-12"
            />
          )}
          <span className="text-sm font-mono">{barcode.code}</span>
          {selectedProduct && (
            <span className="text-sm text-muted-foreground">
              {products.find(p => p.id === selectedProduct)?.name}
            </span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "format",
    header: "Format"
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue("status")
      return (
        <div className="flex items-center gap-2">
          {status === 'valid' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {status === 'conflict' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          {status === 'pending' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          <span>{status}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "error",
    header: "Error"
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const barcode = row.original as GeneratedBarcode
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPreviewBarcode(barcode)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  }
]

export function BulkBarcodeGenerator() {
  const { toast } = useToast()
  const { products = [], categories = [] } = useProducts() || {}
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [config, setConfig] = useState<BulkBarcodeConfig>({
    format: 'CODE128',
    startSequence: 1,
    quantity: 10,
    templateId: 'default',
    prefix: '',
    suffix: '',
    checksum: true,
    size: { width: 2, height: 100 }
  })
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [barcodes, setBarcodes] = useState<GeneratedBarcode[]>([])
  const [previewBarcode, setPreviewBarcode] = useState<GeneratedBarcode | null>(null)
  const [open, setOpen] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.length < 2 ? false : 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || !selectedCategory ? true : 
      product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const generateBarcodeDataUrl = async (barcode: GeneratedBarcode): Promise<string> => {
    const canvas = document.createElement('canvas')
    
    try {
      if (barcode.format === 'QR') {
        await QRCode.toCanvas(canvas, barcode.code, {
          width: config.size.height,
          margin: 1
        })
      } else {
        JsBarcode(canvas, barcode.code, {
          format: barcode.format,
          width: config.size.width,
          height: config.size.height,
          displayValue: false,
          margin: 0
        })
      }
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Failed to generate barcode image:', error)
      return ''
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress(0)
    setBarcodes([])

    try {
      const total = config.quantity
      const newBarcodes: GeneratedBarcode[] = []
      const existingCodes = new Set<string>()
      
      // Add existing product barcodes to check for conflicts
      products.forEach(product => {
        if (product.barcode) {
          existingCodes.add(product.barcode)
        }
      })

      // Generate barcodes
      for (let i = 0; i < total; i++) {
        const sequenceNum = config.startSequence + i
        let code = `${config.prefix || ''}${sequenceNum}${config.suffix || ''}`
        
        // Add checksum for specific formats if needed
        if (config.checksum && (config.format === 'EAN13' || config.format === 'UPCA')) {
          code = generateChecksum(code, config.format)
        }
        
        // Check if code is valid for the selected format
        const isValid = validateBarcode(code, config.format)
        
        // Check if code conflicts with existing barcodes
        const hasConflict = existingCodes.has(code)
        
        const barcode: GeneratedBarcode = {
          id: `barcode-${i}`,
          code,
          format: config.format,
          status: 'pending',
        }
        
        if (!isValid) {
          barcode.status = 'conflict'
          barcode.error = 'Invalid format'
        } else if (hasConflict) {
          barcode.status = 'conflict'
          barcode.error = 'Already exists'
        } else {
          barcode.status = 'valid'
          existingCodes.add(code) // Add to set to check future conflicts
        }
        
        newBarcodes.push(barcode)
        setProgress(Math.round(((i + 1) / total) * 100))
      }
      
      // Generate data URLs for valid barcodes
      for (let i = 0; i < newBarcodes.length; i++) {
        if (newBarcodes[i].status === 'valid') {
          newBarcodes[i].dataUrl = await generateBarcodeDataUrl(newBarcodes[i])
        }
        setProgress(Math.round(((i + 1) / newBarcodes.length) * 100))
      }
      
      setBarcodes(newBarcodes)
      
      // Show toast with summary
      const validCount = newBarcodes.filter(b => b.status === 'valid').length
      const conflictCount = newBarcodes.filter(b => b.status === 'conflict').length
      
      toast({
        title: "Barcode Generation Complete",
        description: `Generated ${validCount} valid barcodes. ${conflictCount} conflicts found.`,
        variant: conflictCount > 0 ? "destructive" : "default"
      })
      
    } catch (error) {
      console.error('Failed to generate barcodes:', error)
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating barcodes.",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = async () => {
    try {
      const validBarcodes = barcodes.filter(b => b.status === 'valid')
      
      if (validBarcodes.length === 0) {
        toast({
          title: "No Valid Barcodes",
          description: "There are no valid barcodes to print.",
          variant: "destructive"
        })
        return
      }
      
      // In a real implementation, this would send to a print service
      await printService.printBarcodes(validBarcodes, {
        templateId: config.templateId,
        productName: selectedProduct ? products.find(p => p.id === selectedProduct)?.name : undefined,
        includePrice: includePrice,
        includeProductName: includeProductName
      })
      
      toast({
        title: "Print Job Sent",
        description: `${validBarcodes.length} barcodes sent to printer.`
      })
    } catch (error) {
      console.error('Failed to print barcodes:', error)
      toast({
        title: "Print Failed",
        description: "An error occurred while sending to printer.",
        variant: "destructive"
      })
    }
  }

  const handleExport = () => {
    try {
      const validBarcodes = barcodes.filter(b => b.status === 'valid')
      
      if (validBarcodes.length === 0) {
        toast({
          title: "No Valid Barcodes",
          description: "There are no valid barcodes to export.",
          variant: "destructive"
        })
        return
      }
      
      // Create PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      
      const margin = 10
      const barcodeWidth = 50
      const barcodeHeight = 30
      const itemsPerRow = Math.floor((pageWidth - 2 * margin) / barcodeWidth)
      const rowHeight = barcodeHeight + 10
      
      let currentX = margin
      let currentY = margin
      let pageNum = 1
      
      validBarcodes.forEach((barcode, index) => {
        // Check if we need a new page
        if (currentY + rowHeight > pageHeight - margin) {
          doc.addPage()
          pageNum++
          currentY = margin
        }
        
        // Check if we need a new row
        if (currentX + barcodeWidth > pageWidth - margin) {
          currentX = margin
          currentY += rowHeight
        }
        
        // Add barcode image
        if (barcode.dataUrl) {
          doc.addImage(
            barcode.dataUrl,
            'PNG',
            currentX,
            currentY,
            barcodeWidth,
            barcodeHeight - 10
          )
        }
        
        // Add barcode text
        doc.setFontSize(8)
        doc.text(
          barcode.code,
          currentX + barcodeWidth / 2,
          currentY + barcodeHeight - 5,
          { align: 'center' }
        )
        
        // Add product name if selected
        if (selectedProduct && includeProductName) {
          const product = products.find(p => p.id === selectedProduct)
          if (product) {
            doc.setFontSize(6)
            doc.text(
              product.name.substring(0, 20) + (product.name.length > 20 ? '...' : ''),
              currentX + barcodeWidth / 2,
              currentY + barcodeHeight - 2,
              { align: 'center' }
            )
          }
        }
        
        // Move to next position
        currentX += barcodeWidth
      })
      
      // Save PDF
      doc.save('barcodes.pdf')
      
      toast({
        title: "Export Complete",
        description: `${validBarcodes.length} barcodes exported to PDF.`
      })
    } catch (error) {
      console.error('Failed to export barcodes:', error)
      toast({
        title: "Export Failed",
        description: "An error occurred while creating PDF.",
        variant: "destructive"
      })
    }
  }

  const [includeProductName, setIncludeProductName] = useState(true)
  const [includePrice, setIncludePrice] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-select">Product (Optional)</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedProduct
                    ? products.find(product => product.id === selectedProduct)?.name
                    : "Select product..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search products..."
                    className="h-9"
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <div className="border-t">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-[200px]">
                      {filteredProducts.map(product => (
                        <CommandItem
                          key={product.id}
                          value={product.id}
                          onSelect={(currentValue) => {
                            setSelectedProduct(currentValue)
                            setOpen(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-sm text-muted-foreground">
                              SKU: {product.sku} | Barcode: {product.barcode}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode-format">Barcode Format</Label>
            <Select
              value={config.format}
              onValueChange={(value: any) => setConfig({ ...config, format: value })}
            >
              <SelectTrigger id="barcode-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CODE128">CODE128</SelectItem>
                <SelectItem value="CODE39">CODE39</SelectItem>
                <SelectItem value="EAN13">EAN13</SelectItem>
                <SelectItem value="UPCA">UPC-A</SelectItem>
                <SelectItem value="QR">QR Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-sequence">Start Sequence</Label>
            <Input
              id="start-sequence"
              type="number"
              value={config.startSequence}
              onChange={(e) => setConfig({ ...config, startSequence: parseInt(e.target.value) || 1 })}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={config.quantity}
              onChange={(e) => setConfig({ ...config, quantity: parseInt(e.target.value) || 10 })}
              min={1}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select
              value={config.templateId}
              onValueChange={(value: any) => setConfig({ ...config, templateId: value })}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="small">Small Labels (24 per sheet)</SelectItem>
                <SelectItem value="medium">Medium Labels (12 per sheet)</SelectItem>
                <SelectItem value="large">Large Labels (8 per sheet)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="use-checksum"
              checked={config.checksum}
              onCheckedChange={(checked) => setConfig({ ...config, checksum: checked })}
            />
            <Label htmlFor="use-checksum">Generate checksum</Label>
          </div>
          
          <div className="space-y-2">
            <Label>Include Information</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-product-name"
                  checked={includeProductName}
                  onCheckedChange={setIncludeProductName}
                  disabled={!selectedProduct}
                />
                <Label htmlFor="include-product-name">Product Name</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-price"
                  checked={includePrice}
                  onCheckedChange={(checked) => {
                    if (checked && !includeProductName) {
                      setIncludeProductName(true)
                    }
                    setIncludePrice(checked)
                  }}
                  disabled={!selectedProduct || !includeProductName}
                />
                <Label htmlFor="include-price">Price</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handlePrint}
            disabled={!barcodes.length || generating}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={!barcodes.length || generating}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {generating && (
        <Progress value={progress} className="w-full" />
      )}

      {barcodes.length > 0 && (
        <DataTable
          columns={columns(setPreviewBarcode)}
          data={barcodes}
        />
      )}

      <Dialog open={!!previewBarcode} onOpenChange={() => setPreviewBarcode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Barcode Preview</DialogTitle>
          </DialogHeader>
          {previewBarcode && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <BarcodePreview
                  code={previewBarcode.code}
                  format={previewBarcode.format as any}
                  width={4}
                  height={200}
                  fontSize={16}
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-sm">{previewBarcode.code}</p>
                <p className="text-sm text-muted-foreground">Format: {previewBarcode.format}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add default export for the component
export default BulkBarcodeGenerator;
