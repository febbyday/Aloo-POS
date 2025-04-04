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
  Badge,
  Avatar,
  AvatarFallback,
  Progress,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui';
import {
  ArrowLeft,
  User,
  ShoppingBag,
  BadgePercent,
  Clock,
  Edit,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Package,
  Heart,
  ChevronRight,
  Receipt,
  BarChart,
  Tag
} from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';
import CustomerPurchaseHistory from '../components/CustomerPurchaseHistory';
import LoyaltyCard from '../components/LoyaltyCard';
import CustomerActivityLog from '../components/CustomerActivityLog';
import { useConfirm, useToast } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useCustomerRealTime } from '../hooks/useCustomerRealTime';
import { deleteCustomer } from '../services/customerService';
import { Toolbar } from "@/components/ui/toolbar/toolbar";

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

  // Configure toolbar buttons
  const toolbarGroups = customer ? [
    {
      buttons: [
        {
          icon: ArrowLeft,
          label: "Back",
          onClick: () => navigate('/customers')
        }
      ]
    },
    {
      buttons: [
        {
          icon: Edit,
          label: "Edit Customer",
          onClick: () => setIsEditing(true)
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
          icon: Receipt,
          label: "New Sale",
          onClick: () => {
            toast({
              title: "Create New Sale",
              description: "Creating a new sale for this customer"
            });
          }
        },
        {
          icon: Mail,
          label: "Email",
          onClick: () => {
            window.open(`mailto:${customer.email}`);
          },
          disabled: !customer.email
        }
      ]
    }
  ] : [];

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Calculate progress to next tier
  const calculateNextTierProgress = (customer: any) => {
    if (!customer.loyaltyTier) return { current: 0, next: 100, progress: 0 };

    const current = customer.loyaltyPoints || 0;
    const nextTierThreshold = customer.loyaltyTier.maxPoints + 1;
    const progress = Math.min(100, (current / nextTierThreshold) * 100);

    return {
      current,
      next: nextTierThreshold,
      progress
    };
  };

  // For the status badge
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-700 border-green-200';
      case 'inactive': return 'bg-amber-500/20 text-amber-700 border-amber-200';
      case 'blocked': return 'bg-red-500/20 text-red-700 border-red-200';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
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

  const nextTierProgress = calculateNextTierProgress(customer);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Toolbar */}
      <Toolbar
        groups={toolbarGroups}
        variant="default"
        size="default"
      />

      {/* Customer Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24 border-4 border-muted/20">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(customer.firstName, customer.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {customer.firstName} {customer.lastName}
            </h1>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </Badge>
            {isSubscribed && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <span className="animate-pulse mr-1.5 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                Live Updates
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap mt-2 gap-x-6 gap-y-1 text-muted-foreground">
            {customer.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1.5" />
                <span>{customer.email}</span>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1.5" />
                <span>{customer.phone}</span>
              </div>
            )}

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>Customer since {formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Purchase Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <ShoppingBag className="h-5 w-5 mr-2 text-indigo-500" />
              Purchase Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Total Spent</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{formatCurrency(customer.totalSpent || 0)}</span>
                  <span className="ml-2 text-xs text-muted-foreground">lifetime value</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Orders</p>
                  <p className="text-xl font-semibold">{customer.totalPurchases || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Last Purchase</p>
                  <p className="text-sm">
                    {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <div className="flex justify-between items-center">
                <span>View Purchase History</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>

        {/* Loyalty Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BadgePercent className="h-5 w-5 mr-2 text-amber-500" />
              Loyalty Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Current Points</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{customer.loyaltyPoints || 0}</span>
                  <span className="ml-2 text-xs text-muted-foreground">points earned</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-xs text-muted-foreground uppercase">
                    {customer.loyaltyTier?.name || 'Standard'} Tier
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nextTierProgress.current} / {nextTierProgress.next} points
                  </p>
                </div>
                <Progress value={nextTierProgress.progress} className="h-2" />
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Current Tier</p>
                <Badge className="bg-amber-500/20 text-amber-700 border-amber-200 px-2 py-1">
                  {customer.loyaltyTier?.name || 'Standard'} Member
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <div className="flex justify-between items-center">
                <span>Manage Loyalty</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>

        {/* Contact & Address Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customer.email && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{customer.email}</p>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Phone</p>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{customer.phone}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Address</p>
                {customer.address ? (
                  <div className="flex">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      {customer.address.street}<br />
                      {customer.address.city}, {customer.address.state} {customer.address.zipCode}<br />
                      {customer.address.country}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No address on file</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsEditing(true)}>
              <div className="flex justify-between items-center w-full">
                <span>Update Contact Info</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="purchases" className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Purchase History
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center">
            <BadgePercent className="h-4 w-4 mr-2" />
            Loyalty Program
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
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