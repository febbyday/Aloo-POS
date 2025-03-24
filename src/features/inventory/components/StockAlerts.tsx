import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Alert } from "../types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StockAlertsProps {
  alerts: Alert[]
  onResolve?: (alertId: string) => void
  onIgnore?: (alertId: string) => void
}

export function StockAlerts({ alerts, onResolve, onIgnore }: StockAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Alerts</CardTitle>
        <CardDescription>Recent alerts for low or out of stock items</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <p className="font-medium">{alert.productName}</p>
                        <Badge 
                          variant={alert.type === 'out_of_stock' ? 'destructive' : 'warning'}
                        >
                          {alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Store: {alert.storeName} | Current Stock: {alert.currentStock} | Min Stock: {alert.minStock}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {onResolve && (
                        <button
                          onClick={() => onResolve(alert.id)}
                          className="rounded-full p-1 text-green-500 hover:bg-green-500/10"
                          title="Mark as Resolved"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      {onIgnore && (
                        <button
                          onClick={() => onIgnore(alert.id)}
                          className="rounded-full p-1 text-gray-500 hover:bg-gray-500/10"
                          title="Ignore Alert"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
