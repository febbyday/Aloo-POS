import { Card } from "@/components/ui/card"
import { MarketReports } from "../components/MarketReports"

export function MarketReportsPage() {
  // Mock market data - replace with actual data fetching
  const mockMarket = {
    id: '1',
    name: 'Central Market',
    location: 'Downtown',
    analytics: {
      sales: {
        total: 150000,
        daily: 5000,
        trend: 15,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 10000)
        }))
      },
      revenue: {
        total: 450000,
        daily: 15000,
        trend: 12,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 30000)
        }))
      },
      conversion: {
        rate: 68,
        trend: 5
      },
      topProducts: [
        {
          id: '1',
          name: 'Product A',
          sales: 1200,
          revenue: 36000,
          turnover: 85
        },
        {
          id: '2',
          name: 'Product B',
          sales: 950,
          revenue: 28500,
          turnover: 72
        },
        {
          id: '3',
          name: 'Product C',
          sales: 850,
          revenue: 25500,
          turnover: 65
        }
      ]
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-0 border-0 shadow-none">
        <MarketReports market={mockMarket} />
      </Card>
    </div>
  )
}
