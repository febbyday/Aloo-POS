import { useState } from 'react';
import {
  Search,
  RefreshCw,
  Filter,
  Download,
  Plus,
  Save,
  Clipboard,
  CheckCircle2,
  XCircle,
  AlertTriangle
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/toast';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CountItem {
  id: string;
  sku: string;
  name: string;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  notes: string;
  status: 'pending' | 'matched' | 'discrepancy';
}

interface CountSession {
  id: string;
  name: string;
  location: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  items: CountItem[];
}

export function InventoryCountPage() {
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<CountSession>({
    id: 'count_1',
    name: 'Q1 2024 Count - Warehouse A',
    location: 'Warehouse A',
    status: 'in_progress',
    startedAt: new Date(),
    items: [
      {
        id: 'item_1',
        sku: 'BTS-001',
        name: 'Blue T-Shirt',
        expectedQuantity: 50,
        actualQuantity: 48,
        variance: -2,
        notes: '',
        status: 'discrepancy'
      },
      {
        id: 'item_2',
        sku: 'BJ-001',
        name: 'Black Jeans',
        expectedQuantity: 30,
        actualQuantity: 30,
        variance: 0,
        notes: '',
        status: 'matched'
      },
      {
        id: 'item_3',
        sku: 'RS-001',
        name: 'Running Shoes',
        expectedQuantity: 25,
        actualQuantity: 0,
        variance: 0,
        notes: '',
        status: 'pending'
      }
    ]
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your count session data is being updated."
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Your count session data export is being prepared."
    });
  };

  const handleUpdateCount = (itemId: string, actualQuantity: number) => {
    setActiveSession(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const variance = actualQuantity - item.expectedQuantity;
          return {
            ...item,
            actualQuantity,
            variance,
            status: variance === 0 ? 'matched' : 'discrepancy'
          };
        }
        return item;
      })
    }));
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setActiveSession(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    }));
  };

  const handleCompleteSession = () => {
    const pendingItems = activeSession.items.filter(item => item.status === 'pending');
    if (pendingItems.length > 0) {
      toast({
        title: "Cannot Complete Session",
        description: "There are still pending items to be counted.",
        variant: "destructive"
      });
      return;
    }

    setActiveSession(prev => ({
      ...prev,
      status: 'completed',
      completedAt: new Date()
    }));

    toast({
      title: "Session Completed",
      description: "Inventory count session has been completed successfully."
    });
  };

  const getStatusBadgeVariant = (status: CountItem['status']) => {
    switch (status) {
      case 'matched':
        return 'success';
      case 'discrepancy':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: CountItem['status']) => {
    switch (status) {
      case 'matched':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'discrepancy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clipboard className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Inventory Count</h1>
        </div>
        <div className="flex gap-2">
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
            onClick={handleCompleteSession}
            disabled={activeSession.status === 'completed'}
          >
            <Save className="h-4 w-4 mr-2" />
            Complete Count
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Session Name</Label>
          <p className="text-lg font-medium">{activeSession.name}</p>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <p className="text-lg font-medium">{activeSession.location}</p>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Badge variant={activeSession.status === 'completed' ? 'success' : 'secondary'}>
            {activeSession.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Count Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{activeSession.items.length}</p>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Counted</p>
            <p className="text-2xl font-bold">
              {activeSession.items.filter(item => item.status !== 'pending').length}
            </p>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Discrepancies</p>
            <p className="text-2xl font-bold">
              {activeSession.items.filter(item => item.status === 'discrepancy').length}
            </p>
          </div>
        </div>
      </div>

      {/* Count Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeSession.items.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.sku}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">{item.expectedQuantity}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={item.actualQuantity}
                    onChange={(e) => handleUpdateCount(item.id, parseInt(e.target.value))}
                    className="w-24 text-right"
                    disabled={activeSession.status === 'completed'}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <span className={item.variance < 0 ? 'text-red-500' : item.variance > 0 ? 'text-green-500' : ''}>
                    {item.variance > 0 ? '+' : ''}{item.variance}
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    value={item.notes}
                    onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                    placeholder="Add notes..."
                    disabled={activeSession.status === 'completed'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}