import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CustomReportConfig, ReportField, ReportFilter } from "../types"
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUpDown,
  Calendar,
  Hash,
  Type,
  Check
} from "lucide-react"

interface ReportBuilderProps {
  report: CustomReportConfig | null
  onSave: (report: CustomReportConfig) => void
  onCancel: () => void
}

// Available data sources for fields
const dataSources = {
  sales: {
    date: { name: "Sale Date", type: "date" },
    amount: { name: "Sale Amount", type: "number" },
    quantity: { name: "Quantity", type: "number" },
    discount: { name: "Discount", type: "number" },
    profit: { name: "Profit", type: "number" }
  },
  products: {
    name: { name: "Product Name", type: "string" },
    category: { name: "Category", type: "string" },
    price: { name: "Price", type: "number" },
    cost: { name: "Cost", type: "number" }
  },
  customers: {
    name: { name: "Customer Name", type: "string" },
    email: { name: "Email", type: "string" },
    phone: { name: "Phone", type: "string" },
    joinDate: { name: "Join Date", type: "date" }
  },
  staff: {
    name: { name: "Staff Name", type: "string" },
    role: { name: "Role", type: "string" },
    department: { name: "Department", type: "string" }
  }
}

export function ReportBuilder({ report, onSave, onCancel }: ReportBuilderProps) {
  const [currentReport, setCurrentReport] = useState<CustomReportConfig>(
    report || {
      id: "",
      name: "",
      description: "",
      createdBy: "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [],
      filters: [],
      chartType: "table"
    }
  )

  const handleAddField = () => {
    const newField: ReportField = {
      id: Math.random().toString(36).substring(2, 9),
      name: "",
      source: "",
      dataType: "string",
      visible: true
    }
    setCurrentReport({
      ...currentReport,
      fields: [...currentReport.fields, newField]
    })
  }

  const handleRemoveField = (fieldId: string) => {
    setCurrentReport({
      ...currentReport,
      fields: currentReport.fields.filter(f => f.id !== fieldId)
    })
  }

  const handleFieldChange = (fieldId: string, changes: Partial<ReportField>) => {
    setCurrentReport({
      ...currentReport,
      fields: currentReport.fields.map(field =>
        field.id === fieldId ? { ...field, ...changes } : field
      )
    })
  }

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const fields = Array.from(currentReport.fields)
    if (direction === 'up' && index > 0) {
      const temp = fields[index - 1]
      fields[index - 1] = fields[index]
      fields[index] = temp
    } else if (direction === 'down' && index < fields.length - 1) {
      const temp = fields[index + 1]
      fields[index + 1] = fields[index]
      fields[index] = temp
    }
    setCurrentReport({
      ...currentReport,
      fields
    })
  }

  const getSourceIcon = (dataType: string) => {
    switch (dataType) {
      case "date":
        return <Calendar className="h-4 w-4" />
      case "number":
        return <Hash className="h-4 w-4" />
      case "string":
        return <Type className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fields" className="space-y-4">
            <TabsList>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="sorting">Sorting & Grouping</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Report Fields</h3>
                <Button onClick={handleAddField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-2">
                {currentReport.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg mb-2 bg-white"
                  >
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveField(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveField(index, 'down')}
                        disabled={index === currentReport.fields.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={field.name}
                          onChange={(e) => handleFieldChange(field.id, { name: e.target.value })}
                          placeholder="Field name"
                        />
                      </div>

                      <div>
                        <Label>Source</Label>
                        <Select
                          value={field.source}
                          onValueChange={(value) => {
                            const [table, field] = value.split(".")
                            const dataType = dataSources[table as keyof typeof dataSources][field as any].type
                            handleFieldChange(field, { source: value, dataType })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(dataSources).map(([table, fields]) => (
                              <div key={table}>
                                <div className="px-2 py-1.5 text-sm font-semibold">{table}</div>
                                {Object.entries(fields).map(([field, info]) => (
                                  <SelectItem key={`${table}.${field}`} value={`${table}.${field}`}>
                                    <div className="flex items-center">
                                      {getSourceIcon(info.type)}
                                      <span className="ml-2">{info.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Aggregation</Label>
                        <Select
                          value={field.aggregation || "none"}
                          onValueChange={(value) =>
                            handleFieldChange(field.id, {
                              aggregation: value === "none" ? undefined : value as any
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select aggregation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="avg">Average</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.visible}
                            onCheckedChange={(checked) =>
                              handleFieldChange(field.id, { visible: checked })
                            }
                          />
                          <Label>{field.visible ? "Visible" : "Hidden"}</Label>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </div>
              {/* Filter configuration UI will go here */}
            </TabsContent>

            <TabsContent value="sorting" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Sort By</Label>
                  <Select
                    value={currentReport.sortBy}
                    onValueChange={(value) =>
                      setCurrentReport({ ...currentReport, sortBy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field to sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentReport.fields.map((field) => (
                        <SelectItem key={field.id} value={field.name}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort Direction</Label>
                  <Select
                    value={currentReport.sortDirection}
                    onValueChange={(value: "asc" | "desc") =>
                      setCurrentReport({ ...currentReport, sortDirection: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Group By</Label>
                  <Select
                    value={currentReport.groupBy}
                    onValueChange={(value) =>
                      setCurrentReport({ ...currentReport, groupBy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field to group by" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentReport.fields
                        .filter((field) => !field.aggregation)
                        .map((field) => (
                          <SelectItem key={field.id} value={field.name}>
                            {field.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <div>
                <Label>Chart Type</Label>
                <Select
                  value={currentReport.chartType}
                  onValueChange={(value: "bar" | "line" | "pie" | "table") =>
                    setCurrentReport({ ...currentReport, chartType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(currentReport)}>Save Report</Button>
      </div>
    </div>
  )
}
