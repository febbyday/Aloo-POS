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
  Globe,
  MapPin,
  FileText,
  Package,
  BarChart,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Supplier, SUPPLIER_STATUS } from '../types';
import { Toolbar } from "@/components/ui/toolbar/toolbar";

export function SupplierDetailsPage() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch supplier data
  useEffect(() => {
    if (supplierId) {
      setLoading(true);
      // Mock data for now - in a real app, you would fetch from an API
      setSupplier({
        id: supplierId,
        name: 'Sample Supplier',
        type: 'Manufacturer',
        contactPerson: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        products: 10,
        rating: 4.5,
        status: 'Active',
        lastOrder: '2023-01-15',
        address: '123 Business St, City, Country',
        website: 'https://example.com',
        notes: 'Reliable supplier with good quality products.'
      } as Supplier);
      setLoading(false);
    }
  }, [supplierId]);

  const handleDelete = () => {
    if (!supplier) return;
    
    if (confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      // In a real app, you would call an API to delete the supplier
      toast({
        title: "Supplier deleted",
        description: `${supplier.name} has been deleted successfully.`
      });
      navigate('/suppliers');
    }
  };

  // Configure toolbar buttons
  const toolbarGroups = supplier ? [
    {
      buttons: [
        { 
          icon: ArrowLeft, 
          label: "Back", 
          onClick: () => navigate('/suppliers')
        }
      ]
    },
    {
      buttons: [
        { 
          icon: Edit, 
          label: "Edit Supplier", 
          onClick: () => navigate(`/suppliers/${supplierId}/edit`)
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
          icon: ShoppingCart, 
          label: "Create Order", 
          onClick: () => {
            toast({
              title: "Create New Order",
              description: "Creating a new purchase order for this supplier"
            });
          }
        }
      ]
    }
  ] : [];

  if (loading) {
    return <div>Loading supplier data...</div>;
  }

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Toolbar 
        groups={toolbarGroups}
        variant="default"
        size="default"
      />
      
      {/* Supplier Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {supplier.name}
              </h1>
              <Badge className={supplier.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {supplier.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{supplier.type}</p>
          </div>
        </div>
      </div>
      
      {/* Supplier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplier.contactPerson && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Contact Person</p>
                  <p className="text-sm">{supplier.contactPerson}</p>
                </div>
              )}
              
              {supplier.email && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{supplier.email}</p>
                  </div>
                </div>
              )}
              
              {supplier.phone && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Phone</p>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{supplier.phone}</p>
                  </div>
                </div>
              )}
              
              {supplier.website && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Website</p>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{supplier.website}</p>
                  </div>
                </div>
              )}
              
              {supplier.address && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Address</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{supplier.address}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Products Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Package className="h-5 w-5 mr-2 text-indigo-500" />
              Products Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Total Products</p>
                <p className="text-3xl font-bold">{supplier.products}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Rating</p>
                <div className="flex items-center">
                  <span className="text-xl font-semibold">{supplier.rating}</span>
                  <span className="text-yellow-500 ml-2">★★★★☆</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Last Order</p>
                <p className="text-sm">{supplier.lastOrder}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" className="w-full">
              View All Products
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
            <p className="text-sm">{supplier.notes || 'No notes available for this supplier.'}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs Section */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>View all orders placed with this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No orders found for this supplier.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
              <CardDescription>Performance metrics and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No performance data available.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Recent activities and changes</CardDescription>
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
