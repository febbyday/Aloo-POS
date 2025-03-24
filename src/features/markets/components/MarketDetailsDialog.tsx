import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Market } from '../pages/MarketsPage'
import { 
  Tent,
  MapPin,
  Calendar,
  Users,
  Package,
  Clock,
  DollarSign,
  BarChart3,
  CalendarRange,
  Building2,
  CircleDot,
  ArrowUpDown,
  Truck,
  ShieldCheck,
  Warehouse,
  Settings,
  FileText
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketStockTransfer } from './MarketStockTransfer'
import { ViewProductsDialog } from '@/features/products/components/ViewProductsDialog'
import { MarketAnalytics } from './MarketAnalytics'
import { MarketProducts } from './MarketProducts'
import { MarketReports } from './MarketReports'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MarketDetailsDialogProps {
  market: Market
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarketDetailsDialog({ 
  market,
  open,
  onOpenChange
}: MarketDetailsDialogProps) {
  const [viewProductsOpen, setViewProductsOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
      case 'completed':
        return 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
    }
  }

  const OverviewTab = () => {
    const [showAllStaff, setShowAllStaff] = useState(false)
    const [showResourceDetails, setShowResourceDetails] = useState(false)

    return (
    <div className="space-y-8">
      {/* Basic Info */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Market Information</h3>
            <p className="text-sm text-muted-foreground">Basic details about the market</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("font-medium", getStatusColor(market.status || 'active'))}>
              {market.status || 'Active'}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Edit Details
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <Building2 className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors" />
              <div>
                <p className="text-sm font-medium">Organization</p>
                <p className="text-sm text-muted-foreground">{market.organization || 'Main Organization'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <MapPin className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{market.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <CircleDot className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors" />
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">{market.type || 'Regular Market'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <Calendar className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {market.startDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <CalendarRange className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((market.endDate.getTime() - market.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <Clock className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors" />
              <div>
                <p className="text-sm font-medium">Operating Hours</p>
                <p className="text-sm text-muted-foreground">
                  {market.operatingHours || '9:00 AM - 6:00 PM'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Resource Allocation */}
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Resource Allocation</h3>
            <p className="text-sm text-muted-foreground">Overview of market resources and assignments</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResourceDetails(!showResourceDetails)}
          >
            {showResourceDetails ? 'Show Less' : 'Show Details'}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div 
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setShowAllStaff(!showAllStaff)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Stock Allocation</span>
                </div>
                <span className="text-sm font-medium">
                  {market.stockAllocation.allocated} / {market.stockAllocation.total}
                </span>
              </div>
              <Progress
                value={(market.stockAllocation.allocated / market.stockAllocation.total) * 100}
                className="h-2.5"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Items allocated</span>
                <span className="font-medium">{((market.stockAllocation.allocated / market.stockAllocation.total) * 100).toFixed(1)}%</span>
              </div>
              {showResourceDetails && (
                <div className="mt-4 space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Available Stock</span>
                    <span className="font-medium">{market.stockAllocation.total - market.stockAllocation.allocated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reserved Stock</span>
                    <span className="font-medium">{market.stockAllocation.allocated}</span>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setShowAllStaff(!showAllStaff)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Staff Assignment</span>
                </div>
                <span className="text-sm font-medium">
                  {market.staffAssigned.assigned} / {market.staffAssigned.required}
                </span>
              </div>
              <Progress
                value={(market.staffAssigned.assigned / market.staffAssigned.required) * 100}
                className="h-2.5"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Staff assigned</span>
                <span className="font-medium">{((market.staffAssigned.assigned / market.staffAssigned.required) * 100).toFixed(1)}%</span>
              </div>
              {showAllStaff && (
                <div className="mt-4 space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Sales Staff</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Support Staff</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Management</span>
                    <span className="font-medium">1</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Truck className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Logistics</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {market.logistics?.vehicles || 2}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Vehicles assigned</p>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Warehouse className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Storage</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {market.storage?.capacity || '2.5T'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Storage capacity</p>
              </Card>
            </div>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                </div>
                <span className="font-medium">Safety & Compliance</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span className="text-sm">Safety inspection</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">Passed</Badge>
                </div>
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span className="text-sm">Permits</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">Valid</Badge>
                </div>
                {showResourceDetails && (
                  <>
                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                      <span className="text-sm">Insurance</span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                      <span className="text-sm">Health Certification</span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">Valid</Badge>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] h-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tent className="h-5 w-5" />
              {market.name} Details
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="h-[600px] overflow-y-auto">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="analytics" className="h-[600px] overflow-y-auto">
              <MarketAnalytics market={market} />
            </TabsContent>
            <TabsContent value="products" className="h-[600px] overflow-y-auto">
              <MarketProducts market={market} />
            </TabsContent>
            <TabsContent value="reports" className="h-[600px] overflow-y-auto">
              <MarketReports market={market} />
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ViewProductsDialog 
        open={viewProductsOpen}
        onOpenChange={setViewProductsOpen}
        products={market.products || []}
      />
    </>
  )
}