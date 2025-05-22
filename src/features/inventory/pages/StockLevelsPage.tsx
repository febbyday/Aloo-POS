import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, RefreshCw, Download, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function StockLevelsPage() {
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Stock levels are being updated."
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Stock Levels</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Stock levels data will be displayed here. This page is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
