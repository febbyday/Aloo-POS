import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  X,
  AlertCircle,
  Layers,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PriceTier {
  id: string;
  minQuantity: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description?: string;
}

interface PriceTierManagerProps {
  productId: string;
  productName: string;
  basePrice: number;
  priceTiers: PriceTier[];
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => Promise<void>;
  onAddPriceTier: (tier: Omit<PriceTier, 'id'>) => Promise<void>;
  onUpdatePriceTier: (id: string, tier: Partial<Omit<PriceTier, 'id'>>) => Promise<void>;
  onDeletePriceTier: (id: string) => Promise<void>;
}

export const PriceTierManager: React.FC<PriceTierManagerProps> = ({
  productId,
  productName,
  basePrice,
  priceTiers,
  enabled,
  onToggleEnabled,
  onAddPriceTier,
  onUpdatePriceTier,
  onDeletePriceTier,
}) => {
  const { toast } = useToast();
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [newMinQuantity, setNewMinQuantity] = useState<number>(10);
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(5);
  const [newDescription, setNewDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const resetForm = () => {
    setNewMinQuantity(10);
    setNewDiscountType('percentage');
    setNewDiscountValue(5);
    setNewDescription('');
  };

  const handleAddTier = async () => {
    if (newMinQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Minimum quantity must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (newDiscountValue <= 0) {
      toast({
        title: "Invalid Discount",
        description: "Discount value must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    // Check for overlapping tiers
    const existingTier = priceTiers.find(tier => tier.minQuantity === newMinQuantity);
    if (existingTier) {
      toast({
        title: "Duplicate Tier",
        description: "A tier with this minimum quantity already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      await onAddPriceTier({
        minQuantity: newMinQuantity,
        discountType: newDiscountType,
        discountValue: newDiscountValue,
        description: newDescription || undefined,
      });
      
      toast({
        title: "Price Tier Added",
        description: "The quantity-based price tier has been added successfully.",
      });
      
      setIsAddingTier(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add price tier:', error);
      toast({
        title: "Failed to Add Tier",
        description: "An error occurred while adding the price tier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTier = async (id: string) => {
    if (newMinQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Minimum quantity must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (newDiscountValue <= 0) {
      toast({
        title: "Invalid Discount",
        description: "Discount value must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    // Check for overlapping tiers (excluding the current one being edited)
    const existingTier = priceTiers.find(tier => tier.minQuantity === newMinQuantity && tier.id !== id);
    if (existingTier) {
      toast({
        title: "Duplicate Tier",
        description: "A tier with this minimum quantity already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      await onUpdatePriceTier(id, {
        minQuantity: newMinQuantity,
        discountType: newDiscountType,
        discountValue: newDiscountValue,
        description: newDescription || undefined,
      });
      
      toast({
        title: "Price Tier Updated",
        description: "The quantity-based price tier has been updated successfully.",
      });
      
      setEditingTierId(null);
    } catch (error) {
      console.error('Failed to update price tier:', error);
      toast({
        title: "Failed to Update Tier",
        description: "An error occurred while updating the price tier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTier = async (id: string) => {
    try {
      setIsProcessing(true);
      await onDeletePriceTier(id);
      
      toast({
        title: "Price Tier Deleted",
        description: "The quantity-based price tier has been deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete price tier:', error);
      toast({
        title: "Failed to Delete Tier",
        description: "An error occurred while deleting the price tier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditTier = (tier: PriceTier) => {
    setEditingTierId(tier.id);
    setNewMinQuantity(tier.minQuantity);
    setNewDiscountType(tier.discountType);
    setNewDiscountValue(tier.discountValue);
    setNewDescription(tier.description || '');
  };

  const cancelEdit = () => {
    setEditingTierId(null);
    resetForm();
  };

  const cancelAdd = () => {
    setIsAddingTier(false);
    resetForm();
  };

  const handleToggleEnabled = async () => {
    try {
      setIsProcessing(true);
      await onToggleEnabled(!enabled);
      
      toast({
        title: enabled ? "Quantity Pricing Disabled" : "Quantity Pricing Enabled",
        description: enabled 
          ? "Quantity-based pricing has been disabled." 
          : "Quantity-based pricing has been enabled.",
      });
    } catch (error) {
      console.error('Failed to toggle quantity pricing:', error);
      toast({
        title: "Failed to Update Setting",
        description: "An error occurred while updating the setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateDiscountedPrice = (tier: PriceTier) => {
    if (tier.discountType === 'percentage') {
      return basePrice * (1 - tier.discountValue / 100);
    } else {
      return basePrice - tier.discountValue;
    }
  };

  // Sort tiers by minimum quantity
  const sortedTiers = [...priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Quantity-Based Pricing
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="enable-quantity-pricing" className="text-sm">
              {enabled ? 'Enabled' : 'Disabled'}
            </Label>
            <Switch
              id="enable-quantity-pricing"
              checked={enabled}
              onCheckedChange={handleToggleEnabled}
              disabled={isProcessing}
            />
          </div>
        </div>
        <CardDescription>
          Set up quantity discounts for {productName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enabled && (
          <>
            {!isAddingTier && (
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingTier(true)}
                  disabled={isAddingTier || editingTierId !== null || isProcessing}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Price Tier
                </Button>
              </div>
            )}

            {isAddingTier && (
              <Card className="mb-6 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Add New Price Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-quantity">Minimum Quantity</Label>
                      <Input
                        id="min-quantity"
                        type="number"
                        placeholder="10"
                        value={newMinQuantity}
                        onChange={(e) => setNewMinQuantity(parseInt(e.target.value) || 0)}
                        min="1"
                        step="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discount-type">Discount Type</Label>
                      <Select
                        value={newDiscountType}
                        onValueChange={(value) => setNewDiscountType(value as 'percentage' | 'fixed')}
                      >
                        <SelectTrigger id="discount-type">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discount-value">Discount Value</Label>
                      <div className="relative">
                        {newDiscountType === 'fixed' && (
                          <span className="absolute left-3 top-2.5">$</span>
                        )}
                        <Input
                          id="discount-value"
                          type="number"
                          className={newDiscountType === 'fixed' ? 'pl-6' : ''}
                          placeholder={newDiscountType === 'percentage' ? '5' : '5.00'}
                          value={newDiscountValue}
                          onChange={(e) => setNewDiscountValue(parseFloat(e.target.value) || 0)}
                          min="0.01"
                          step={newDiscountType === 'percentage' ? '1' : '0.01'}
                        />
                        {newDiscountType === 'percentage' && (
                          <span className="absolute right-3 top-2.5">%</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tier-description">Description (Optional)</Label>
                      <Input
                        id="tier-description"
                        placeholder="e.g., Bulk Discount"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 border rounded-md bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Preview:</span>
                      <div className="text-sm">
                        <span className="font-medium">Buy {newMinQuantity}+ units:</span>
                        <span className="ml-2">
                          ${calculateDiscountedPrice({
                            id: '',
                            minQuantity: newMinQuantity,
                            discountType: newDiscountType,
                            discountValue: newDiscountValue
                          }).toFixed(2)} per unit
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          (Save {newDiscountType === 'percentage' 
                            ? `${newDiscountValue}%` 
                            : `$${newDiscountValue.toFixed(2)}`})
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={cancelAdd}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddTier}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Saving...' : 'Save Tier'}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {sortedTiers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min. Quantity</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTiers.map((tier) => (
                      <TableRow key={tier.id}>
                        {editingTierId === tier.id ? (
                          <>
                            <TableCell>
                              <Input
                                type="number"
                                className="w-24"
                                value={newMinQuantity}
                                onChange={(e) => setNewMinQuantity(parseInt(e.target.value) || 0)}
                                min="1"
                                step="1"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Select
                                  value={newDiscountType}
                                  onValueChange={(value) => setNewDiscountType(value as 'percentage' | 'fixed')}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="relative">
                                  {newDiscountType === 'fixed' && (
                                    <span className="absolute left-3 top-2.5">$</span>
                                  )}
                                  <Input
                                    type="number"
                                    className={`w-24 ${newDiscountType === 'fixed' ? 'pl-6' : ''}`}
                                    value={newDiscountValue}
                                    onChange={(e) => setNewDiscountValue(parseFloat(e.target.value) || 0)}
                                    min="0.01"
                                    step={newDiscountType === 'percentage' ? '1' : '0.01'}
                                  />
                                  {newDiscountType === 'percentage' && (
                                    <span className="absolute right-3 top-2.5">%</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              ${calculateDiscountedPrice({
                                id: '',
                                minQuantity: newMinQuantity,
                                discountType: newDiscountType,
                                discountValue: newDiscountValue
                              }).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="e.g., Bulk Discount"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={cancelEdit}
                                  disabled={isProcessing}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleUpdateTier(tier.id)}
                                  disabled={isProcessing}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium">{tier.minQuantity}+</TableCell>
                            <TableCell>
                              {tier.discountType === 'percentage' 
                                ? `${tier.discountValue}%` 
                                : `$${tier.discountValue.toFixed(2)}`}
                            </TableCell>
                            <TableCell>${calculateDiscountedPrice(tier).toFixed(2)}</TableCell>
                            <TableCell>{tier.description || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditTier(tier)}
                                  disabled={isAddingTier || editingTierId !== null || isProcessing}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteTier(tier.id)}
                                  disabled={isProcessing}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Price Tiers</h3>
                <p className="text-muted-foreground mb-4">
                  Create quantity-based discounts to encourage larger purchases.
                </p>
                {!isAddingTier && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingTier(true)}
                    disabled={isAddingTier || editingTierId !== null}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Price Tier
                  </Button>
                )}
              </div>
            )}

            {sortedTiers.length > 0 && (
              <div className="mt-4 p-4 border rounded-md bg-muted/30">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Quantity-based pricing will automatically apply discounts based on the quantity ordered. Tiers are applied based on the minimum quantity threshold.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {!enabled && (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Quantity-Based Pricing Disabled</h3>
            <p className="text-muted-foreground mb-4">
              Enable quantity-based pricing to offer discounts for bulk purchases.
            </p>
            <Button 
              variant="outline" 
              onClick={handleToggleEnabled}
              disabled={isProcessing}
            >
              Enable Quantity Pricing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceTierManager;
