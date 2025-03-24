import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MarketsTable } from '../components/MarketsTable'
import { MarketWizard } from '../components/MarketWizard'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'

export type Market = {
  id: string
  name: string
  location: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  progress: number
  stockAllocation: {
    allocated: number
    total: number
  }
  staffAssigned: {
    assigned: number
    required: number
  }
  products?: {
    id: string
    name: string
    sku: string
    category: string
    description: string
    image: string
    price: number
    stock: number
    locations: {
      id: string
      stock: number
    }[]
  }[]
  analytics?: {
    sales: {
      total: number
      daily: number
      trend: number
      history: {
        date: string
        value: number
      }[]
    }
    revenue: {
      total: number
      daily: number
      trend: number
      history: {
        date: string
        value: number
      }[]
    }
    conversion: {
      rate: number
      trend: number
    }
    topProducts: {
      id: string
      name: string
      sales: number
      revenue: number
      turnover: number
    }[]
  }
}

export type MarketFilter = {
  search?: string
  status?: Market['status']
  dateRange?: {
    from: Date
    to: Date
  }
}

export function MarketsPage() {
  const [filters, setFilters] = useState<MarketFilter>({})
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [wizardOpen, setWizardOpen] = useState(false)
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your markets data is being updated."
    })
  }

  const handleNewMarket = () => {
    setWizardOpen(true)
  }

  const handleEditMarket = () => {
    if (selectedMarkets.length !== 1) {
      toast({
        title: "Select one market",
        description: "Please select exactly one market to edit.",
        variant: "destructive"
      })
      return
    }
    // TODO: Implement edit market
    toast({
      title: "Coming Soon",
      description: "Market editing will be available soon."
    })
  }

  const handleDeleteMarket = () => {
    if (selectedMarkets.length === 0) {
      toast({
        title: "No markets selected",
        description: "Please select at least one market to delete.",
        variant: "destructive"
      })
      return
    }
    // TODO: Implement delete confirmation
    toast({
      title: "Delete Market",
      description: "Delete functionality will be implemented soon.",
      variant: "destructive"
    })
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Coming Soon",
      description: "Export functionality will be available soon."
    })
  }

  const handleViewMarketDetails = (market: Market) => {
    // TODO: Implement view details
    toast({
      title: "Coming Soon",
      description: "Market details view will be available soon."
    })
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <MarketsTable
            filters={filters}
            selectedMarkets={selectedMarkets}
            onSelectionChange={setSelectedMarkets}
            onEdit={handleEditMarket}
            onViewDetails={handleViewMarketDetails}
            onRefresh={handleRefresh}
            onNewMarket={handleNewMarket}
            onDeleteMarket={handleDeleteMarket}
            onExport={handleExport}
            setFilters={setFilters}
          />
        </CardContent>
      </Card>

      <MarketWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={(data) => {
          toast({
            title: "Market Created",
            description: `Successfully created market: ${data.name}`
          })
          setWizardOpen(false)
        }}
      />
    </div>
  )
}
