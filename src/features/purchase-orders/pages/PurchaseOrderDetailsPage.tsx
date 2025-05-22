import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Badge,
} from '@/components/ui';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ShoppingCart,
  Building2,
  Mail,
  Phone,
  FileText,
  Package,
  BarChart,
  Clock,
  DollarSign,
  Truck,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/lib/toast';
import { Toolbar } from "@/components/ui/toolbar/toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export function PurchaseOrderDetailsPage() {
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [purchaseOrder, setPurchaseOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch purchase order data
  useEffect(() => {
    if (purchaseOrderId) {
      setLoading(true);
      // Mock data for now - in a real app, you would fetch from an API
      setPurchaseOrder({
        id: purchaseOrderId,
        orderNumber: `PO-${purchaseOrderId}`,
        supplier: {
          id: "SUP-001",
          name: "Audio Supplies Co.",
          email: "contact@audiosupplies.com",
          phone: "123-456-7890"
        },
        date: "2024-02-24",
        status: "Pending",
        total: 2499.99,
        items: [
          {
            id: "1",
            productName: "Professional Microphone",
            sku: "MIC-001",
            quantity: 2,
            unitPrice: 499.99,
            total: 999.98
          },
          {
            id: "2",
            productName: "Audio Interface",
            sku: "AIF-002",
            quantity: 1,
            unitPrice: 1500.01,
            total: 1500.01
          }
        ],
        expectedDelivery: "2024-03-01",
        notes: "Please deliver to the back entrance."
      });
      setLoading(false);
    }
  }, [purchaseOrderId]);

  const handleDelete = () => {
    if (!purchaseOrder) return;

    if (confirm(`Are you sure you want to delete purchase order ${purchaseOrder.orderNumber}?`)) {
      // In a real app, you would call an API to delete the purchase order
      toast({
        title: "Purchase order deleted",
        description: `${purchaseOrder.orderNumber} has been deleted successfully.`
      });
      navigate('/purchase-orders');
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Configure toolbar buttons
  const toolbarGroups = purchaseOrder ? [
    {
      buttons: [
        {
          icon: ArrowLeft,
          label: "Back",
          onClick: () => navigate('/purchase-orders')
        }
      ]
    },
    {
      buttons: [
        {
          icon: Edit,
          label: "Edit Order",
          onClick: () => navigate(`/purchase-orders/${purchaseOrderId}/edit`)
        },
        {
          icon: Trash2,
          label: "Delete",
          onClick: handleDelete
        }
      ]
    },
    {
      buttons: [
        {
          icon: CheckCircle,
          label: "Mark as Received",
          onClick: () => {
            toast({
              title: "Order Received",
              description: "The order has been marked as received."
            });
          }
        }
      ]
    }
  ] : [];

  if (loading) {
    return <div>Loading purchase order data...</div>;
  }

  if (!purchaseOrder) {
    return <div>Purchase order not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Toolbar
        groups={toolbarGroups}
        variant="default"
        size="default"
      />

      {/* Purchase Order Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {purchaseOrder.orderNumber}
              </h1>
              <Badge className={getStatusColor(purchaseOrder.status)}>
                {purchaseOrder.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">Order from {purchaseOrder.supplier.name}</p>
          </div>
        </div>
      </div>

      {/* Purchase Order Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Order Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{purchaseOrder.date}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Expected Delivery</p>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{purchaseOrder.expectedDelivery}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Total Amount</p>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">${purchaseOrder.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Building2 className="h-5 w-5 mr-2 text-indigo-500" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Supplier Name</p>
                <p className="text-sm font-semibold">{purchaseOrder.supplier.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{purchaseOrder.supplier.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Phone</p>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{purchaseOrder.supplier.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/suppliers/${purchaseOrder.supplier.id}`)}>
              View Supplier
            </Button>
          </CardFooter>
        </Card>

        {/* Notes Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-green-500" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{purchaseOrder.notes || 'No notes available for this order.'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>Products included in this purchase order</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">Total:</TableCell>
                <TableCell className="text-right font-bold">${purchaseOrder.total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="timeline" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Track the progress of your purchase order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className="bg-blue-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">{purchaseOrder.date}</p>
                    <p className="text-sm mt-1">Purchase order was created and sent to supplier.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className="bg-yellow-500 rounded-full p-1">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Awaiting Confirmation</p>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className="text-sm mt-1">Waiting for supplier to confirm the order.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
              <CardDescription>View and download documents related to this order</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No documents available for this order.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View changes and updates to this order</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No history data available.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
