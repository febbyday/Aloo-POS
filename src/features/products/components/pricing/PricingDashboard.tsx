import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useProducts } from "../../context/ProductContext"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils/formatters"

export function PricingDashboard() {
  const { products, priceHistory, specialPrices } = useProducts()

  // Calculate average price
  const averagePrice = products.length
    ? products.reduce((acc, product) => acc + product.price, 0) / products.length
    : 0

  // Calculate price changes in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentPriceChanges = priceHistory.filter(
    (history) => new Date(history.date) >= thirtyDaysAgo
  )

  // Calculate active special prices
  const now = new Date()
  const activeSpecialPrices = specialPrices.filter(
    (special) =>
      new Date(special.startDate) <= now && new Date(special.endDate) >= now
  )

  // Generate mock data for the price trend chart
  const mockChartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split("T")[0],
      averagePrice: averagePrice + (Math.random() - 0.5) * 10,
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Average Product Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averagePrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {products.length} products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Price Changes (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentPriceChanges.length}
            </div>
            <p className="text-xs text-muted-foreground">
              In the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Active Special Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSpecialPrices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Products Below Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {products.filter(p => p.price < (p.costPrice || 0)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Trend</CardTitle>
            <CardDescription>
              Average product price over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.split("-").slice(1).join("/")}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="averagePrice"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest price changes and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceHistory.slice(0, 5).map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium">
                      {products.find(p => p.id === history.productId)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(history.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(history.price)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PricingDashboard;
