import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, Settings2, Tag, Percent, Calendar, ArrowUpDown, CheckCircle2, XCircle, Copy, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Switch } from "@/components/ui/switch"

// Mock data for pricing rules
const mockPricingRules = [
  {
    id: '1',
    name: 'Holiday Season Discount',
    type: 'percentage',
    value: 20,
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    conditions: ['Category: Wallets', 'Min Price: $50'],
    priority: 1
  },
  {
    id: '2',
    name: 'Bulk Purchase Discount',
    type: 'fixed',
    value: 10,
    status: 'active',
    startDate: '2024-03-01',
    endDate: null,
    conditions: ['Min Quantity: 5'],
    priority: 2
  },
  {
    id: '3',
    name: 'Clearance Sale',
    type: 'percentage',
    value: 30,
    status: 'scheduled',
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    conditions: ['Category: Travel', 'Max Stock: 10'],
    priority: 3
  },
  {
    id: '4',
    name: 'New Customer Discount',
    type: 'percentage',
    value: 15,
    status: 'active',
    startDate: '2024-03-01',
    endDate: null,
    conditions: ['First Purchase Only'],
    priority: 4
  }
]

const editRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calculationType: z.enum(["percentage", "fixed", "markup"]),
  value: z.number().min(0, "Value must be positive"),
  roundingMethod: z.enum(["none", "up", "down", "nearest"]),
  roundingValue: z.number().min(0, "Rounding value must be positive"),
  minimumPrice: z.number().min(0, "Minimum price must be positive"),
  maximumPrice: z.number().min(0, "Maximum price must be positive"),
  applyToAllProducts: z.boolean(),
  isActive: z.boolean(),
})

// Add this new component before the main PricingRules component
function PriceRuleForm({
  form,
  onSubmit,
  onCancel,
  mode,
}: {
  form: any,
  onSubmit: (values: z.infer<typeof editRuleSchema>) => void,
  onCancel: () => void,
  mode: 'add' | 'edit'
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter rule name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calculationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calculation Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select calculation type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="markup">Markup</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="roundingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rounding Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rounding method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Rounding</SelectItem>
                    <SelectItem value="up">Round Up</SelectItem>
                    <SelectItem value="down">Round Down</SelectItem>
                    <SelectItem value="nearest">Round to Nearest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roundingValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rounding Value</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minimumPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maximumPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="applyToAllProducts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Apply to All Products</FormLabel>
                  <FormDescription>
                    Enable this to apply the rule to all products
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Enable or disable this pricing rule
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'add' ? 'Add Rule' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export function PricingRules() {
  const [searchQuery, setSearchQuery] = useState('')
  const [rules, setRules] = useState(mockPricingRules)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedRule, setSelectedRule] = useState<typeof mockPricingRules[0] | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof editRuleSchema>>({
    resolver: zodResolver(editRuleSchema),
    defaultValues: {
      name: "",
      calculationType: "percentage",
      value: 0,
      roundingMethod: "none",
      roundingValue: 0,
      minimumPrice: 0,
      maximumPrice: 0,
      applyToAllProducts: false,
      isActive: true,
    },
  })

  const resetForm = (initialData?: typeof mockPricingRules[0]) => {
    form.reset({
      name: initialData?.name || "",
      calculationType: initialData?.type || "percentage",
      value: initialData?.value || 0,
      roundingMethod: "none",
      roundingValue: 0,
      minimumPrice: 0,
      maximumPrice: 0,
      applyToAllProducts: false,
      isActive: initialData?.status === "active",
    })
  }

  const handleAdd = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const handleEdit = (rule: typeof mockPricingRules[0]) => {
    setSelectedRule(rule)
    resetForm(rule)
    setShowEditDialog(true)
  }

  const onSubmitAdd = (values: z.infer<typeof editRuleSchema>) => {
    const newRule = {
      ...values,
      id: `${rules.length + 1}`,
      conditions: [], // Default empty conditions for new rule
    }
    setRules([...rules, newRule])
    toast({
      title: "Rule Added",
      description: `Successfully added: ${values.name}`,
    })
    setShowAddDialog(false)
  }

  const onSubmitEdit = (values: z.infer<typeof editRuleSchema>) => {
    if (selectedRule) {
      const updatedRule = {
        ...selectedRule,
        ...values,
        conditions: selectedRule.conditions || [], // Preserve existing conditions or use empty array
      }
      setRules(rules.map(rule => 
        rule.id === selectedRule.id ? updatedRule : rule
      ))
      toast({
        title: "Rule Updated",
        description: `Successfully updated: ${values.name}`,
      })
      setShowEditDialog(false)
      setSelectedRule(null)
    }
  }

  const handleDuplicate = (rule: typeof mockPricingRules[0]) => {
    const newRule = {
      ...rule,
      id: `${parseInt(rule.id) + rules.length}`,
      name: `${rule.name} (Copy)`,
    }
    setRules([...rules, newRule])
    toast({
      title: "Rule Duplicated",
      description: `Successfully duplicated: ${rule.name}`,
    })
  }

  const handleDelete = (rule: typeof mockPricingRules[0]) => {
    setSelectedRule(rule)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (selectedRule) {
      setRules(rules.filter(r => r.id !== selectedRule.id))
      toast({
        title: "Rule Deleted",
        description: `Successfully deleted: ${selectedRule.name}`,
        variant: "destructive",
      })
      setShowDeleteDialog(false)
      setSelectedRule(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pricing Rules</CardTitle>
              <CardDescription>Manage and configure automatic pricing rules</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative w-full overflow-auto">
            <DataTable
              data={rules}
              columns={[
                {
                  id: "select",
                  header: ({ table }) => (
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                      aria-label="Select all"
                      className="translate-y-[2px]"
                    />
                  ),
                  cell: ({ row }) => (
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select row"
                      className="translate-y-[2px]"
                    />
                  ),
                  enableSorting: false,
                  enableHiding: false,
                },
                {
                  accessorKey: "name",
                  header: "Rule Name",
                  cell: ({ row }) => (
                    <div className="font-medium">{row.getValue("name")}</div>
                  ),
                },
                {
                  accessorKey: "type",
                  header: "Type",
                  cell: ({ row }) => {
                    const type = row.getValue("type") as string
                    const value = row.getValue("value") as number
                    return (
                      <div className="flex items-center">
                        {type === 'percentage' ? (
                          <Badge variant="secondary" className="font-medium">
                            <Percent className="h-3 w-3 mr-1" />
                            {value}% Off
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-medium">
                            <Tag className="h-3 w-3 mr-1" />
                            ${value} Off
                          </Badge>
                        )}
                      </div>
                    )
                  },
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }) => {
                    const status = row.getValue("status") as string
                    return (
                      <div className="flex items-center">
                        {status === 'active' ? (
                          <Badge variant="success" className="font-medium">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : status === 'scheduled' ? (
                          <Badge variant="warning" className="font-medium">
                            <Calendar className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="font-medium">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    )
                  },
                },
                {
                  accessorKey: "conditions",
                  header: "Conditions",
                  cell: ({ row }) => {
                    const conditions = row.getValue("conditions") as string[]
                    return (
                      <div className="flex flex-wrap gap-1">
                        {conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    )
                  },
                },
                {
                  accessorKey: "priority",
                  header: ({ column }) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                      Priority
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ),
                  cell: ({ row }) => (
                    <div className="font-medium">{row.getValue("priority")}</div>
                  ),
                },
                {
                  id: "actions",
                  header: ({ column }) => (
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                      >
                        Actions
                      </Button>
                    </div>
                  ),
                  cell: ({ row }) => {
                    const rule = row.original

                    return (
                      <TooltipProvider>
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(rule)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Rule</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDuplicate(rule)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate Rule</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(rule)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Rule</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    )
                  },
                },
              ]}
              enableRowSelection
              className="[&_[role=cell]]:py-3"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Pricing Rule</DialogTitle>
            <DialogDescription>
              Make changes to the pricing rule. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <PriceRuleForm
            form={form}
            onSubmit={onSubmitEdit}
            onCancel={() => setShowEditDialog(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Pricing Rule</DialogTitle>
            <DialogDescription>
              Create a new pricing rule. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <PriceRuleForm
            form={form}
            onSubmit={onSubmitAdd}
            onCancel={() => setShowAddDialog(false)}
            mode="add"
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRule?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PricingRules; 