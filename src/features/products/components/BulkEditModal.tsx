import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from '@/components/unified-error-boundary';

/**
 * BulkEditModal - Allows editing multiple products at once
 * 
 * This component provides a modal interface for applying edits to multiple selected products.
 * Users can choose which fields they want to update and the changes will be applied to all
 * selected products.
 */
export function BulkEditModal({
  open,
  onOpenChange,
  selectedProducts,
  onSave,
  categories,
  suppliers,
}: BulkEditModalProps) {
  const { toast } = useToast();
  
  // Track which fields should be updated
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Record<string, boolean>>({
    category: false,
    status: false,
    tax: false,
    supplier: false,
    retailPrice: false,
    salePrice: false,
    cost: false,
    minStock: false,
    maxStock: false,
    description: false,
    tags: false,
  });
  
  // Store the values for fields that will be updated
  const [updates, setUpdates] = useState<Partial<Product>>({
    category: "",
    status: "active",
    tax: 0,
    supplier: { id: "", name: "" },
    retailPrice: 0,
    salePrice: 0,
    cost: 0,
    minStock: 0,
    maxStock: 0,
    description: "",
    tags: [],
  });

  // Toggle which fields to update
  const toggleField = (field: string) => {
    setFieldsToUpdate((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle input change for updates
  const handleUpdateChange = (field: string, value: any) => {
    setUpdates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filter updates to only include fields marked for update
  const getUpdatesToApply = () => {
    const updatesToApply: Partial<Product> = {};
    
    Object.entries(fieldsToUpdate).forEach(([field, shouldUpdate]) => {
      if (shouldUpdate) {
        updatesToApply[field as keyof Product] = updates[field as keyof Product];
      }
    });
    
    return updatesToApply;
  };

  // Apply the changes to selected products
  const handleApplyChanges = () => {
    const updatesToApply = getUpdatesToApply();
    
    // Check if any fields are selected for update
    if (Object.keys(updatesToApply).length === 0) {
      toast({
        title: "No fields selected",
        description: "Please select at least one field to update.",
        variant: "destructive",
      });
      return;
    }
    
    // Get IDs of selected products
    const productIds = selectedProducts.map((product) => product.id);
    
    // Call the onSave callback with updates and product IDs
    onSave(updatesToApply, productIds);
    
    // Reset form and close modal
    resetForm();
    onOpenChange(false);
    
    toast({
      title: "Bulk update successful",
      description: `Updated ${productIds.length} products successfully.`,
    });
  };

  // Reset the form to initial state
  const resetForm = () => {
    setFieldsToUpdate({
      category: false,
      status: false,
      tax: false,
      supplier: false,
      retailPrice: false,
      salePrice: false,
      cost: false,
      minStock: false,
      maxStock: false,
      description: false,
      tags: false,
    });
    
    setUpdates({
      category: "",
      status: "active",
      tax: 0,
      supplier: { id: "", name: "" },
      retailPrice: 0,
      salePrice: 0,
      cost: 0,
      minStock: 0,
      maxStock: 0,
      description: "",
      tags: [],
    });
  };

  return (
    <ErrorBoundary>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Bulk Edit {selectedProducts.length} Products</DialogTitle>
              <DialogDescription>
                Select the fields you want to update and their new values.
                Changes will be applied to all selected products.
                <span className="block mt-1 font-medium">
                  {selectedProducts.length} products selected
                </span>
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-category"
                        checked={fieldsToUpdate.category}
                        onCheckedChange={() => toggleField("category")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          disabled={!fieldsToUpdate.category}
                          value={updates.category as string}
                          onValueChange={(value) => handleUpdateChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-status"
                        checked={fieldsToUpdate.status}
                        onCheckedChange={() => toggleField("status")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          disabled={!fieldsToUpdate.status}
                          value={updates.status as string}
                          onValueChange={(value) => handleUpdateChange("status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-supplier"
                        checked={fieldsToUpdate.supplier}
                        onCheckedChange={() => toggleField("supplier")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Select 
                          disabled={!fieldsToUpdate.supplier}
                          value={(updates.supplier as any)?.id || ""}
                          onValueChange={(value) => {
                            const supplier = suppliers.find(s => s.id === value);
                            handleUpdateChange("supplier", supplier);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-description"
                        checked={fieldsToUpdate.description}
                        onCheckedChange={() => toggleField("description")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          disabled={!fieldsToUpdate.description}
                          value={updates.description as string}
                          onChange={(e) => handleUpdateChange("description", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-retailPrice"
                        checked={fieldsToUpdate.retailPrice}
                        onCheckedChange={() => toggleField("retailPrice")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="retailPrice">Retail Price</Label>
                        <Input
                          type="number"
                          id="retailPrice"
                          disabled={!fieldsToUpdate.retailPrice}
                          value={updates.retailPrice as number}
                          onChange={(e) => handleUpdateChange("retailPrice", parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-salePrice"
                        checked={fieldsToUpdate.salePrice}
                        onCheckedChange={() => toggleField("salePrice")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="salePrice">Sale Price</Label>
                        <Input
                          type="number"
                          id="salePrice"
                          disabled={!fieldsToUpdate.salePrice}
                          value={updates.salePrice as number}
                          onChange={(e) => handleUpdateChange("salePrice", parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-cost"
                        checked={fieldsToUpdate.cost}
                        onCheckedChange={() => toggleField("cost")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="cost">Cost</Label>
                        <Input
                          type="number"
                          id="cost"
                          disabled={!fieldsToUpdate.cost}
                          value={updates.cost as number}
                          onChange={(e) => handleUpdateChange("cost", parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-tax"
                        checked={fieldsToUpdate.tax}
                        onCheckedChange={() => toggleField("tax")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="tax">Tax Rate (%)</Label>
                        <Input
                          type="number"
                          id="tax"
                          disabled={!fieldsToUpdate.tax}
                          value={updates.tax as number}
                          onChange={(e) => handleUpdateChange("tax", parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-minStock"
                        checked={fieldsToUpdate.minStock}
                        onCheckedChange={() => toggleField("minStock")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="minStock">Minimum Stock Level</Label>
                        <Input
                          type="number"
                          id="minStock"
                          disabled={!fieldsToUpdate.minStock}
                          value={updates.minStock as number}
                          onChange={(e) => handleUpdateChange("minStock", parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox 
                        id="update-maxStock"
                        checked={fieldsToUpdate.maxStock}
                        onCheckedChange={() => toggleField("maxStock")}
                      />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="maxStock">Maximum Stock Level</Label>
                        <Input
                          type="number"
                          id="maxStock"
                          disabled={!fieldsToUpdate.maxStock}
                          value={updates.maxStock as number}
                          onChange={(e) => handleUpdateChange("maxStock", parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <DialogFooter className="pt-4">
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyChanges}>
                    Apply to {selectedProducts.length} Products
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </ErrorBoundary>
  );
} 