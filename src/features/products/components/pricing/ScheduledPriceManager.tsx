import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ScheduledPrice {
  id: string;
  price: number;
  startDate: Date;
  endDate: Date;
  description?: string;
  status: 'active' | 'scheduled' | 'expired';
}

interface ScheduledPriceManagerProps {
  productId: string;
  productName: string;
  currentPrice: number;
  scheduledPrices: ScheduledPrice[];
  onAddScheduledPrice: (price: Omit<ScheduledPrice, 'id' | 'status'>) => Promise<void>;
  onUpdateScheduledPrice: (id: string, price: Partial<Omit<ScheduledPrice, 'id' | 'status'>>) => Promise<void>;
  onDeleteScheduledPrice: (id: string) => Promise<void>;
}

export const ScheduledPriceManager: React.FC<ScheduledPriceManagerProps> = ({
  productId,
  productName,
  currentPrice,
  scheduledPrices,
  onAddScheduledPrice,
  onUpdateScheduledPrice,
  onDeleteScheduledPrice,
}) => {
  const { toast } = useToast();
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(currentPrice);
  const [newStartDate, setNewStartDate] = useState<Date>(new Date());
  const [newEndDate, setNewEndDate] = useState<Date>(new Date());
  const [newDescription, setNewDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Set default end date to 7 days from now when adding a new price
  useEffect(() => {
    if (isAddingPrice) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      setNewEndDate(endDate);
    }
  }, [isAddingPrice]);

  const resetForm = () => {
    setNewPrice(currentPrice);
    setNewStartDate(new Date());
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    setNewEndDate(endDate);
    setNewDescription('');
  };

  const handleAddPrice = async () => {
    if (newPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (newStartDate >= newEndDate) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      await onAddScheduledPrice({
        price: newPrice,
        startDate: newStartDate,
        endDate: newEndDate,
        description: newDescription || undefined,
      });
      
      toast({
        title: "Price Scheduled",
        description: "The scheduled price has been added successfully.",
      });
      
      setIsAddingPrice(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add scheduled price:', error);
      toast({
        title: "Failed to Schedule Price",
        description: "An error occurred while scheduling the price. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePrice = async (id: string) => {
    if (newPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (newStartDate >= newEndDate) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      await onUpdateScheduledPrice(id, {
        price: newPrice,
        startDate: newStartDate,
        endDate: newEndDate,
        description: newDescription || undefined,
      });
      
      toast({
        title: "Price Updated",
        description: "The scheduled price has been updated successfully.",
      });
      
      setEditingPriceId(null);
    } catch (error) {
      console.error('Failed to update scheduled price:', error);
      toast({
        title: "Failed to Update Price",
        description: "An error occurred while updating the scheduled price. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePrice = async (id: string) => {
    try {
      setIsProcessing(true);
      await onDeleteScheduledPrice(id);
      
      toast({
        title: "Price Deleted",
        description: "The scheduled price has been deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete scheduled price:', error);
      toast({
        title: "Failed to Delete Price",
        description: "An error occurred while deleting the scheduled price. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPrice = (price: ScheduledPrice) => {
    setEditingPriceId(price.id);
    setNewPrice(price.price);
    setNewStartDate(price.startDate);
    setNewEndDate(price.endDate);
    setNewDescription(price.description || '');
  };

  const cancelEdit = () => {
    setEditingPriceId(null);
    resetForm();
  };

  const cancelAdd = () => {
    setIsAddingPrice(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scheduled Prices</span>
          {!isAddingPrice && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingPrice(true)}
              disabled={isAddingPrice || editingPriceId !== null}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Scheduled Price
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Schedule price changes for {productName} in advance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAddingPrice && (
          <Card className="mb-6 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Add New Scheduled Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="new-price"
                      type="number"
                      className="pl-6"
                      placeholder="0.00"
                      value={newPrice}
                      onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-description">Description (Optional)</Label>
                  <Input
                    id="new-description"
                    placeholder="e.g., Summer Sale"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newStartDate ? format(newStartDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newStartDate}
                        onSelect={(date) => date && setNewStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEndDate ? format(newEndDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newEndDate}
                        onSelect={(date) => date && setNewEndDate(date)}
                        initialFocus
                        disabled={(date) => date < newStartDate}
                      />
                    </PopoverContent>
                  </Popover>
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
                onClick={handleAddPrice}
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Save Price'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {scheduledPrices.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledPrices.map((price) => (
                  <TableRow key={price.id}>
                    {editingPriceId === price.id ? (
                      <>
                        <TableCell>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              type="number"
                              className="pl-6 w-24"
                              value={newPrice}
                              onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                              step="0.01"
                              min="0.01"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newStartDate ? format(newStartDate, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newStartDate}
                                onSelect={(date) => date && setNewStartDate(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newEndDate ? format(newEndDate, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newEndDate}
                                onSelect={(date) => date && setNewEndDate(date)}
                                initialFocus
                                disabled={(date) => date < newStartDate}
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="e.g., Summer Sale"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>{getStatusBadge(price.status)}</TableCell>
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
                              onClick={() => handleUpdatePrice(price.id)}
                              disabled={isProcessing}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">${price.price.toFixed(2)}</TableCell>
                        <TableCell>{format(price.startDate, 'PPP')}</TableCell>
                        <TableCell>{format(price.endDate, 'PPP')}</TableCell>
                        <TableCell>{price.description || '-'}</TableCell>
                        <TableCell>{getStatusBadge(price.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditPrice(price)}
                              disabled={isAddingPrice || editingPriceId !== null || isProcessing}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeletePrice(price.id)}
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
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scheduled Prices</h3>
            <p className="text-muted-foreground mb-4">
              Schedule price changes in advance to automate your pricing strategy.
            </p>
            {!isAddingPrice && (
              <Button 
                variant="outline" 
                onClick={() => setIsAddingPrice(true)}
                disabled={isAddingPrice || editingPriceId !== null}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Scheduled Price
              </Button>
            )}
          </div>
        )}

        {scheduledPrices.length > 0 && (
          <div className="mt-4 p-4 border rounded-md bg-muted/30">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Scheduled prices will automatically update the product price when the start date is reached, and revert to the regular price when the end date is reached.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduledPriceManager;
