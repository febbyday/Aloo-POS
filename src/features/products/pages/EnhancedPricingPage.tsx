import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/toast';
import {
  Calendar,
  Layers,
  Users,
  Tag,
  Package,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import {
  ScheduledPriceManager,
  PriceTierManager,
  CustomerGroupsTable,
  PriceHistoryTable
} from '../components/pricing';
import { useProducts } from '../context/ProductContext';

// Mock data for scheduled prices
const mockScheduledPrices = [
  {
    id: '1',
    price: 89.99,
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    description: 'Summer Sale',
    status: 'scheduled' as const
  },
  {
    id: '2',
    price: 79.99,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    description: 'Flash Sale',
    status: 'active' as const
  }
];

// Mock data for price tiers
const mockPriceTiers = [
  {
    id: '1',
    minQuantity: 5,
    discountType: 'percentage' as const,
    discountValue: 5,
    description: 'Small Bulk Discount'
  },
  {
    id: '2',
    minQuantity: 10,
    discountType: 'percentage' as const,
    discountValue: 10,
    description: 'Medium Bulk Discount'
  },
  {
    id: '3',
    minQuantity: 20,
    discountType: 'percentage' as const,
    discountValue: 15,
    description: 'Large Bulk Discount'
  }
];

export function EnhancedPricingPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('scheduled');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [scheduledPrices, setScheduledPrices] = useState(mockScheduledPrices);
  const [priceTiers, setPriceTiers] = useState(mockPriceTiers);
  const [quantityPricingEnabled, setQuantityPricingEnabled] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const productData = await getProduct(productId);
        setProduct(productData);
      } catch (error) {
        console.error('Failed to load product:', error);
        toast({
          title: "Error",
          description: "Failed to load product information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, getProduct, toast]);

  const handleAddScheduledPrice = async (price: any) => {
    // In a real app, you would call an API to add the scheduled price
    const newPrice = {
      id: `sp-${Date.now()}`,
      ...price,
      status: new Date() >= price.startDate && new Date() <= price.endDate ? 'active' : 'scheduled'
    };

    setScheduledPrices([...scheduledPrices, newPrice]);
    return Promise.resolve();
  };

  const handleUpdateScheduledPrice = async (id: string, updates: any) => {
    // In a real app, you would call an API to update the scheduled price
    const updatedPrices = scheduledPrices.map(price => {
      if (price.id === id) {
        const updatedPrice = { ...price, ...updates };
        updatedPrice.status = new Date() >= updatedPrice.startDate && new Date() <= updatedPrice.endDate
          ? 'active'
          : 'scheduled';
        return updatedPrice;
      }
      return price;
    });

    setScheduledPrices(updatedPrices);
    return Promise.resolve();
  };

  const handleDeleteScheduledPrice = async (id: string) => {
    // In a real app, you would call an API to delete the scheduled price
    setScheduledPrices(scheduledPrices.filter(price => price.id !== id));
    return Promise.resolve();
  };

  const handleAddPriceTier = async (tier: any) => {
    // In a real app, you would call an API to add the price tier
    const newTier = {
      id: `pt-${Date.now()}`,
      ...tier
    };

    setPriceTiers([...priceTiers, newTier]);
    return Promise.resolve();
  };

  const handleUpdatePriceTier = async (id: string, updates: any) => {
    // In a real app, you would call an API to update the price tier
    const updatedTiers = priceTiers.map(tier => {
      if (tier.id === id) {
        return { ...tier, ...updates };
      }
      return tier;
    });

    setPriceTiers(updatedTiers);
    return Promise.resolve();
  };

  const handleDeletePriceTier = async (id: string) => {
    // In a real app, you would call an API to delete the price tier
    setPriceTiers(priceTiers.filter(tier => tier.id !== id));
    return Promise.resolve();
  };

  const handleToggleQuantityPricing = async (enabled: boolean) => {
    // In a real app, you would call an API to toggle quantity pricing
    setQuantityPricingEnabled(enabled);
    return Promise.resolve();
  };

  const handleRefresh = () => {
    // In a real app, you would refresh the data from the server
    toast({
      title: "Data Refreshed",
      description: "The pricing information has been refreshed.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-4">The product you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={`Pricing: ${product.name}`}
        description="Manage pricing strategies for this product"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate(`/products/${productId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Product Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">{product.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regular Price:</span>
                <span className="font-medium">${product.retailPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost Price:</span>
                <span className="font-medium">${product.costPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margin:</span>
                <span className="font-medium">
                  {product.retailPrice && product.costPrice
                    ? `${(((product.retailPrice - product.costPrice) / product.retailPrice) * 100).toFixed(2)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Sale Price:</span>
                <span className="font-medium">
                  {product.salePrice
                    ? `$${product.salePrice.toFixed(2)}`
                    : 'No sale price'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('scheduled')}>
                <Calendar className="h-4 w-4 mr-2" />
                Scheduled Prices
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('quantity')}>
                <Layers className="h-4 w-4 mr-2" />
                Quantity Pricing
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('customer')}>
                <Users className="h-4 w-4 mr-2" />
                Customer Group Pricing
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('history')}>
                <Tag className="h-4 w-4 mr-2" />
                Price History
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scheduled">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Scheduled</span>
              </TabsTrigger>
              <TabsTrigger value="quantity">
                <Layers className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Quantity</span>
              </TabsTrigger>
              <TabsTrigger value="customer">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Customer</span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <Tag className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="mt-6">
              <ScheduledPriceManager
                productId={productId || ''}
                productName={product.name}
                currentPrice={product.retailPrice || 0}
                scheduledPrices={scheduledPrices}
                onAddScheduledPrice={handleAddScheduledPrice}
                onUpdateScheduledPrice={handleUpdateScheduledPrice}
                onDeleteScheduledPrice={handleDeleteScheduledPrice}
              />
            </TabsContent>

            <TabsContent value="quantity" className="mt-6">
              <PriceTierManager
                productId={productId || ''}
                productName={product.name}
                basePrice={product.retailPrice || 0}
                priceTiers={priceTiers}
                enabled={quantityPricingEnabled}
                onToggleEnabled={handleToggleQuantityPricing}
                onAddPriceTier={handleAddPriceTier}
                onUpdatePriceTier={handleUpdatePriceTier}
                onDeletePriceTier={handleDeletePriceTier}
              />
            </TabsContent>

            <TabsContent value="customer" className="mt-6">
              <CustomerGroupsTable
                productId={productId || ''}
                productName={product.name}
                basePrice={product.retailPrice || 0}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <PriceHistoryTable
                productId={productId || ''}
                productName={product.name}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default EnhancedPricingPage;
