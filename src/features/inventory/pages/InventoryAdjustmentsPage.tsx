// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! ��

import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Filter,
  Download,
  Plus,
  Save,
  ArrowUpDown,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Undo2,
  Redo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/toast';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInventoryHistory } from '../context/InventoryHistoryContext';
import { FieldHelpTooltip, InfoBox } from '@/components/ui/help-tooltip';
import { OperationButton, ActionStatus, ActionFeedback } from '@/components/ui/action-feedback';

interface AdjustmentItem {
  id: string;
  sku: string;
  name: string;
  quantityBefore: number;
  adjustment: number;
  quantityAfter: number;
  reason: string;
  type: 'increase' | 'decrease';
  createdAt: Date;
  createdBy: string;
}

interface AdjustmentFilter {
  search?: string;
  type?: AdjustmentItem['type'];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function InventoryAdjustmentsPage() {
  // Use the new toast API
  const toast = useToast();

  // Add inventory history for undo/redo support
  const { trackAction, canUndo, undo, canRedo, redo } = useInventoryHistory();

  const [filters, setFilters] = useState<AdjustmentFilter>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partial<AdjustmentItem> | null>(null);

  // Add operation status state
  const [adjustmentStatus, setAdjustmentStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Mock adjustments data - in a real app, this would come from an API
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([
    {
      id: 'adj_1',
      sku: 'BTS-001',
      name: 'Blue T-Shirt',
      quantityBefore: 50,
      adjustment: -2,
      quantityAfter: 48,
      reason: 'Damaged during handling',
      type: 'decrease',
      createdAt: new Date(2024, 2, 1),
      createdBy: 'John Doe'
    },
    {
      id: 'adj_2',
      sku: 'BJ-001',
      name: 'Black Jeans',
      quantityBefore: 28,
      adjustment: 2,
      quantityAfter: 30,
      reason: 'Found misplaced items',
      type: 'increase',
      createdAt: new Date(2024, 2, 2),
      createdBy: 'Jane Smith'
    }
  ]);

  const handleRefresh = () => {
    toast.info("Refreshing data...", "Your adjustment history is being updated.");
  };

  const handleExport = () => {
    toast.info("Exporting Data", "Your adjustment history export is being prepared.");
  };

  const handleNewAdjustment = () => {
    setSelectedItem({
      type: 'increase',
      adjustment: 0
    });
    setDialogOpen(true);
  };

  const handleSaveAdjustment = async (formData: FormData) => {
    try {
      setAdjustmentStatus("loading");

      const sku = formData.get('sku') as string;
      const name = formData.get('name') as string;
      const adjustment = parseInt(formData.get('adjustment') as string);
      const reason = formData.get('reason') as string;
      const type = formData.get('type') as AdjustmentItem['type'];

      if (!sku || !name || !adjustment || !reason || !type) {
        toast.error("Validation Error", "Please fill in all required fields.");
        setAdjustmentStatus("error");
        return;
      }

      // Create the new adjustment
      const newAdjustment: AdjustmentItem = {
        id: `adj_${Date.now()}`,
        sku,
        name,
        quantityBefore: type === 'increase' ? 50 : 30, // Mock values
        adjustment: type === 'increase' ? adjustment : -adjustment,
        quantityAfter: type === 'increase' ? 50 + adjustment : 30 - adjustment, // Mock calculation
        reason,
        type,
        createdAt: new Date(),
        createdBy: 'Current User'
      };

      // Track this action for undo/redo
      trackAction(
        {
          type: 'adjust_stock',
          adjustment: newAdjustment,
          before: newAdjustment.quantityBefore,
          after: newAdjustment.quantityAfter
        },
        `${type === 'increase' ? 'Increased' : 'Decreased'} ${name} by ${adjustment}`
      );

      // Add to adjustments list
      setAdjustments([newAdjustment, ...adjustments]);

      setAdjustmentStatus("success");
      toast.success("Adjustment Saved", "Inventory adjustment has been recorded successfully.");
      setDialogOpen(false);

    } catch (error) {
      console.error('Error saving adjustment:', error);
      setAdjustmentStatus("error");
      toast.error("Error", "Failed to save inventory adjustment.");
    }
  };

  // Add undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z or Command+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        const action = undo();

        if (action && action.type === 'adjust_stock') {
          // Remove the adjustment from the list
          setAdjustments(prev => prev.filter(adj => adj.id !== action.adjustment.id));
          toast.info("Undo", "Adjustment has been undone");
        }
      }

      // Check for Ctrl+Shift+Z or Command+Shift+Z (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey && canRedo) {
        e.preventDefault();
        const action = redo();

        if (action && action.type === 'adjust_stock') {
          // Add the adjustment back to the list
          setAdjustments(prev => [action.adjustment, ...prev]);
          toast.info("Redo", "Adjustment has been reapplied");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, toast]);

  const getAdjustmentBadgeVariant = (type: AdjustmentItem['type']) => {
    return type === 'increase' ? 'success' : 'destructive';
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Inventory Adjustments</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center mr-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (canUndo) {
                  const action = undo();
                  if (action && action.type === 'adjust_stock') {
                    setAdjustments(prev => prev.filter(adj => adj.id !== action.adjustment.id));
                    toast.info("Undo", "Adjustment has been undone");
                  }
                }
              }}
              disabled={!canUndo}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (canRedo) {
                  const action = redo();
                  if (action && action.type === 'adjust_stock') {
                    setAdjustments(prev => [action.adjustment, ...prev]);
                    toast.info("Redo", "Adjustment has been reapplied");
                  }
                }
              }}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
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
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={handleNewAdjustment}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search adjustments..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <Select
          value={filters.type}
          onValueChange={(value: AdjustmentItem['type']) =>
            setFilters(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="increase">Increase</SelectItem>
            <SelectItem value="decrease">Decrease</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setFilters({})}
          className="h-10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      {/* Adjustments Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Before</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Adjustment</TableHead>
              <TableHead className="text-right">After</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Created By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map(adjustment => (
              <TableRow key={adjustment.id}>
                <TableCell>{format(adjustment.createdAt, 'MMM d, yyyy')}</TableCell>
                <TableCell className="font-medium">{adjustment.sku}</TableCell>
                <TableCell>{adjustment.name}</TableCell>
                <TableCell className="text-right">{adjustment.quantityBefore}</TableCell>
                <TableCell>
                  <Badge variant={getAdjustmentBadgeVariant(adjustment.type)}>
                    {adjustment.type === 'increase' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={adjustment.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
                    {adjustment.type === 'increase' ? '+' : ''}{adjustment.adjustment}
                  </span>
                </TableCell>
                <TableCell className="text-right">{adjustment.quantityAfter}</TableCell>
                <TableCell>{adjustment.reason}</TableCell>
                <TableCell>{adjustment.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* New Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Inventory Adjustment</DialogTitle>
            <DialogDescription>
              Record a manual adjustment to inventory quantities.
            </DialogDescription>
          </DialogHeader>

          <ActionFeedback
            status={adjustmentStatus}
            message={adjustmentStatus === "success" ? "Adjustment saved successfully" : "Saving adjustment..."}
            duration={3000}
          >
            <form action={handleSaveAdjustment} className="space-y-4">
              <InfoBox variant="info" className="mb-4">
                Use this form to record manual inventory adjustments. All adjustments are logged for audit purposes.
              </InfoBox>

              <div className="space-y-2">
                <FieldHelpTooltip
                  label="SKU"
                  content="Enter the Stock Keeping Unit (SKU) of the product you want to adjust."
                  required
                />
                <Input id="sku" name="sku" required />
              </div>

              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Product Name"
                  content="Enter the name of the product you want to adjust."
                  required
                />
                <Input id="name" name="name" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldHelpTooltip
                    label="Adjustment Type"
                    content="Select whether you are increasing or decreasing the inventory quantity."
                    required
                  />
                  <Select
                    name="type"
                    value={selectedItem?.type}
                    onValueChange={(value: AdjustmentItem['type']) =>
                      setSelectedItem(prev => prev ? { ...prev, type: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase</SelectItem>
                      <SelectItem value="decrease">Decrease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FieldHelpTooltip
                    label="Quantity"
                    content="Enter the quantity to adjust. This should be a positive number regardless of whether it's an increase or decrease."
                    required
                  />
                  <Input
                    id="adjustment"
                    name="adjustment"
                    type="number"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FieldHelpTooltip
                  label="Reason"
                  content="Provide a detailed explanation for this adjustment. This is important for audit purposes."
                  required
                />
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Explain the reason for this adjustment..."
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <OperationButton
                  type="submit"
                  successMessage="Adjustment saved successfully"
                  errorMessage="Failed to save adjustment"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Adjustment
                </OperationButton>
              </DialogFooter>
            </form>
          </ActionFeedback>
        </DialogContent>
      </Dialog>
    </div>
  );
}