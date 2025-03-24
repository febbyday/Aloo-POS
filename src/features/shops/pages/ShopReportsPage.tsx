import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useToast } from "@/components/ui/use-toast"
import { 
  BarChart,
  LineChart,
  PieChart,
  Download,
  FileText,
  RefreshCw,
  Calendar,
  Store,
  TrendingUp,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react'

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: any;
}

const reportTypes: ReportType[] = [
  {
    id: "daily",
    name: "Daily Performance",
    description: "Daily shop performance metrics",
    icon: Calendar
  },
  {
    id: "sales",
    name: "Sales Analysis",
    description: "Detailed sales analysis by shop",
    icon: ShoppingCart
  },
  {
    id: "inventory",
    name: "Inventory Status",
    description: "Shop inventory levels and movements",
    icon: Package
  },
  {
    id: "staff",
    name: "Staff Performance",
    description: "Staff productivity and attendance",
    icon: Users
  },
  {
    id: "trends",
    name: "Performance Trends",
    description: "Long-term performance analysis",
    icon: TrendingUp
  }
];

export function ShopReportsPage() {
  const [selectedReport, setSelectedReport] = useState("daily");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [chartType, setChartType] = useState<"table" | "bar" | "line" | "pie">("table");
  const { toast } = useToast();

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Report data is being updated."
    });
  };

  const handleExport = () => {
    toast({
      title: "Coming Soon",
      description: "Report export functionality will be available soon."
    });
  };

  const handleSchedule = () => {
    toast({
      title: "Coming Soon",
      description: "Report scheduling functionality will be available soon."
    });
  };

  const renderChart = () => {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded-lg">
        <div className="text-center">
          {chartType === "bar" && <BarChart className="h-16 w-16 text-muted-foreground mb-4" />}
          {chartType === "line" && <LineChart className="h-16 w-16 text-muted-foreground mb-4" />}
          {chartType === "pie" && <PieChart className="h-16 w-16 text-muted-foreground mb-4" />}
          <p className="text-muted-foreground">Chart visualization coming soon</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shop Reports</h2>
          <p className="text-muted-foreground">
            Generate and analyze shop performance reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleSchedule}>
            <FileText className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedReport === report.id ? "border-primary" : ""
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {report.name}
              </CardTitle>
              <report.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {report.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {reportTypes.find(r => r.id === selectedReport)?.name}
              </CardTitle>
              <CardDescription>
                {reportTypes.find(r => r.id === selectedReport)?.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
              <div className="flex rounded-md shadow-sm">
                <Button
                  variant={chartType === "table" ? "default" : "outline"}
                  className="rounded-l-md rounded-r-none"
                  onClick={() => setChartType("table")}
                >
                  Table
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  className="rounded-none border-l-0 border-r-0"
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  className="rounded-none border-r-0"
                  onClick={() => setChartType("line")}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  className="rounded-l-none rounded-r-md"
                  onClick={() => setChartType("pie")}
                >
                  Pie
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}
