import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Package, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Truck,
  BarChart
} from "lucide-react"
import { PerformanceMetrics } from "../components/performance/PerformanceMetrics"
import { PerformanceChart } from "../components/performance/PerformanceChart"
import { SupplierRankingTable } from "../components/performance/SupplierRankingTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data generator
function generateMockData(days: number, baseValue: number, variance: number) {
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))
    return {
      date: date.toISOString().split('T')[0],
      value: baseValue + (Math.random() * variance * 2) - variance
    }
  })
}

// Mock data
const performanceMetrics = {
  avgLeadTime: "5.2",
  onTimeDelivery: "95",
  qualityRating: "4.8",
  totalOrders: "156",
  returnRate: "2.3",
  fulfillmentRate: "98.5",
  totalSpend: "125,430",
  activeSuppliers: "24"
}

const supplierRankings = [
  {
    id: "1",
    name: "Fabric World Ltd",
    rating: 4.8,
    onTime: "98%",
    quality: "4.9/5.0",
    volume: "156 orders",
    trend: 5.2,
    category: "Textiles"
  },
  {
    id: "2",
    name: "Fashion Wholesale Co",
    rating: 4.5,
    onTime: "95%",
    quality: "4.7/5.0",
    volume: "98 orders",
    trend: -2.1,
    category: "Apparel"
  },
  {
    id: "3",
    name: "Global Accessories Inc",
    rating: 4.7,
    onTime: "97%",
    quality: "4.8/5.0",
    volume: "122 orders",
    trend: 3.4,
    category: "Accessories"
  },
  {
    id: "4",
    name: "Premium Materials Co",
    rating: 4.6,
    onTime: "94%",
    quality: "4.6/5.0",
    volume: "87 orders",
    trend: 1.8,
    category: "Raw Materials"
  }
]

// Generate mock chart data
const deliveryTimeData = generateMockData(30, 5.2, 1)
const qualityData = generateMockData(30, 4.8, 0.3)
const orderVolumeData = generateMockData(30, 25, 5)

const mockSuppliers = [
  {
    id: "1",
    name: "Acme Corp",
    rating: 4.8,
    onTime: "95%",
    quality: "4.8/5.0",
    volume: "156",
    trend: 12,
    category: "Electronics"
  },
  {
    id: "2",
    name: "Global Foods",
    rating: 4.6,
    onTime: "92%",
    quality: "4.6/5.0",
    volume: "98",
    trend: 8,
    category: "Food & Beverage"
  },
  {
    id: "3",
    name: "Tech Solutions",
    rating: 4.9,
    onTime: "98%",
    quality: "4.9/5.0",
    volume: "142",
    trend: 15,
    category: "Electronics"
  }
]

export function PerformancePage() {
  return (
    <div className="h-full">
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-0 border-0">
          <PerformanceMetrics />
        </Card>

        <Card className="p-0 border-0">
          <div className="">
            <Tabs defaultValue="monthly" className="space-y-4">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              <TabsContent value="monthly" className="space-y-4">
                <div className="h-[400px]">
                  <PerformanceChart period="monthly" />
                </div>
              </TabsContent>

              <TabsContent value="quarterly" className="space-y-4">
                <div className="h-[400px]">
                  <PerformanceChart period="quarterly" />
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="space-y-4">
                <div className="h-[400px]">
                  <PerformanceChart period="yearly" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  )
}
