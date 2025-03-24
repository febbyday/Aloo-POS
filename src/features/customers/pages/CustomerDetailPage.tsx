/**
 * Customer Detail Page
 * 
 * Displays detailed information about a specific customer, including
 * personal information, purchase history, and loyalty program details.
 * Uses real-time updates via WebSocket for live data.
 */

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
  Badge
} from '@/components/ui';
import { 
  ArrowLeft, 
  User, 
  ShoppingBag, 
  BadgePercent, 
  Clock, 
  Edit, 
  Trash2,
  AlertTriangle 
} from 'lucide-react';
import CustomerForm from '../components/CustomerForm';
import CustomerPurchaseHistory from '../components/CustomerPurchaseHistory';
import LoyaltyCard from '../components/LoyaltyCard';
import CustomerActivityLog from '../components/CustomerActivityLog';
import { useConfirm, useToast } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useCustomerRealTime } from '../hooks/useCustomerRealTime';
import { deleteCustomer } from '../services/customerService';

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Use the real-time customer hook for live updates
  const { 
    customer, 
    loading, 
    error,
    isSubscribed,
    refreshCustomer 
  } = useCustomerRealTime(id);
  
  // Redirect if customer not found after loading
  useEffect(() => {
    if (!loading && !customer && !error) {
      toast({
        title: "Customer not found",
        description: "The customer you're looking for doesn't exist or has been deleted.",
        variant: "destructive"
      });
      navigate('/customers');
    }
  }, [customer, loading, error, navigate, toast]);
  
  // Handle customer deletion
  const handleDelete = async () => {
    if (!customer) return;
    
    const confirmed = await confirm({
      title: "Delete Customer",
      description: `Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    
    if (confirmed) {
      try {
        await deleteCustomer(customer.id);
        toast({
          title: "Customer deleted",
          description: "The customer has been successfully deleted."
        });
        navigate('/customers');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete customer. Please try again.",
          variant: "destructive"
        });
        console.error("Error deleting customer:", error);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-bold">Error Loading Customer</h2>
        <p className="text-muted-foreground">
          There was a problem loading this customer's information.
        </p>
        <Button onClick={() => refreshCustomer()}>
          Try Again
        </Button>
        <Button variant="outline" onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }
  
  if (!customer) return null;
  
  if (isEditing) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            className="mr-2" 
            onClick={() => setIsEditing(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <h1 className="text-2xl font-bold">Edit Customer</h1>
        </div>
        
        <CustomerForm 
          initialData={customer} 
          onSuccess={() => {
            setIsEditing(false);
            refreshCustomer();
            toast({
              title: "Customer updated",
              description: "Customer information has been successfully updated."
            });
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            className="mr-4" 
            onClick={() => navigate('/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-muted-foreground">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSubscribed && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <span className="animate-pulse mr-1.5 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
              Live Updates
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1">{customer.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd className="mt-1">{customer.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                <dd className="mt-1">
                  {customer.address ? (
                    <>
                      {customer.address.street}<br />
                      {customer.address.city}, {customer.address.state} {customer.address.postalCode}<br />
                      {customer.address.country}
                    </>
                  ) : (
                    'No address on file'
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Purchase Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Total Spent</dt>
                <dd className="mt-1 text-2xl font-bold">
                  {formatCurrency(customer.totalSpent || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Orders</dt>
                <dd className="mt-1">
                  <span className="text-2xl font-bold">{customer.orderCount || 0}</span>
                  <span className="text-muted-foreground ml-2">orders placed</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Purchase</dt>
                <dd className="mt-1">
                  {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'No purchases yet'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgePercent className="h-5 w-5 mr-2" />
              Loyalty Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Loyalty Points</dt>
                <dd className="mt-1 text-2xl font-bold">{customer.loyaltyPoints || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tier</dt>
                <dd className="mt-1">
                  {customer.loyaltyTier ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5">
                      {customer.loyaltyTier.name}
                    </Badge>
                  ) : (
                    'Standard'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
                <dd className="mt-1">{formatDate(customer.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList>
          <TabsTrigger value="purchases">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Purchase History
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <BadgePercent className="h-4 w-4 mr-2" />
            Loyalty Program
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="h-4 w-4 mr-2" />
            Activity Log
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases" className="mt-6">
          <CustomerPurchaseHistory customerId={customer.id} />
        </TabsContent>
        
        <TabsContent value="loyalty" className="mt-6">
          <LoyaltyCard 
            customerId={customer.id}
            loyaltyPoints={customer.loyaltyPoints || 0}
            tier={customer.loyaltyTier} 
            onPointsUpdated={refreshCustomer}
          />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <CustomerActivityLog customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetailPage; 