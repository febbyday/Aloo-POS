import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from '@/components/ui/label';
import { Store as StoreIcon, Warehouse } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';

interface Store {
  id: string;
  name: string;
  address?: string;
  location?: string;
  type: string;
}

interface ProductStoreSectionProps {
  form: UseFormReturn<ProductFormData>;
  stores: Store[];
  loadingStores: boolean;
  product: {
    locations?: Array<{
      locationId: string;
      enabled: boolean;
      stock: number;
      minStock: number;
      maxStock: number;
    }>;
  };
  setProduct: React.Dispatch<React.SetStateAction<any>>;
}

export const ProductStoreSection: React.FC<ProductStoreSectionProps> = ({
  form,
  stores,
  loadingStores,
  product,
  setProduct,
}) => {
  // Initialize locations if they don't exist
  useEffect(() => {
    if (stores && stores.length > 0 && (!product.locations || product.locations.length === 0)) {
      setProduct(prev => ({
        ...prev,
        locations: stores.map(store => ({
          locationId: store.id,
          enabled: false,
          stock: 0,
          minStock: 0,
          maxStock: 100
        }))
      }));
    }
  }, [stores, product.locations, setProduct]);

  // Validate store inventory
  useEffect(() => {
    if (product.locations) {
      product.locations.forEach((location, index) => {
        if (location.minStock > location.maxStock) {
          // We can't use form.setError here since these are not direct form fields
          // Instead, we'll update the UI to show the error
          const newLocations = [...product.locations];
          newLocations[index] = {
            ...location,
            hasError: true,
            errorMessage: 'Min stock must be less than max stock'
          };
          setProduct(prev => ({ ...prev, locations: newLocations }));
        }
      });
    }
  }, [product.locations, setProduct]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Store Availability</h3>
            <Badge variant="outline" className="px-3 py-1">
              {product.locations && product.locations.length > 0
                ? `${product.locations.filter(loc => loc.enabled).length} of ${stores?.length || 0} stores selected`
                : "0 stores selected"}
            </Badge>
          </div>
          <Separator />

          {loadingStores ? (
            <div className="p-8 text-center border border-dashed rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-muted-foreground">Loading stores...</p>
            </div>
          ) : !product.locations || product.locations.filter(loc => loc.enabled).length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg">
              <StoreIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">No Stores Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select stores where this product will be available.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  // Enable all stores
                  const newLocations = product.locations ? product.locations.map(loc => ({
                    ...loc,
                    enabled: true
                  })) : [];
                  setProduct({ ...product, locations: newLocations });
                }}
                disabled={!stores || stores.length === 0}
              >
                <StoreIcon className="h-4 w-4 mr-2" />
                Enable All Stores
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4">
                {stores && stores.length > 0 ? stores.map((store) => {
                  const location = product.locations ? product.locations.find(loc => loc.locationId === store.id) : undefined;
                  const isEnabled = location?.enabled || false;

                  return (
                    <Card key={store.id} className={`flex-1 min-w-[250px] transition-all ${isEnabled ? 'ring-2 ring-primary' : 'opacity-70'}`}>
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between p-4">
                          <div className="space-y-1">
                            <div className="font-medium">{store.name}</div>
                            <div className="text-sm text-muted-foreground">{store.location || store.address}</div>
                            <Badge variant={isEnabled ? "default" : "secondary"}>{store.type}</Badge>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => {
                              const newLocations = product.locations.map(loc =>
                                loc.locationId === store.id
                                  ? { ...loc, enabled: checked }
                                  : loc
                              );
                              setProduct({ ...product, locations: newLocations });
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                }) : (
                  <div className="w-full p-4 text-center text-muted-foreground">
                    No stores available
                  </div>
                )}
              </div>

              {/* Stock Management Section - Only shown when stores are selected */}
              <div className="mt-8 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Stock Management</h3>
                  <Badge variant="outline" className="px-3 py-1">
                    {product.locations ? product.locations.filter(loc => loc.enabled).length : 0} stores enabled
                  </Badge>
                </div>

                <div className="space-y-4">
                  {product.locations ? product.locations.filter(loc => loc.enabled).map((location) => {
                    const store = stores.find(s => s.id === location.locationId);
                    const hasError = (location as any).hasError;
                    
                    return (
                      <div key={location.locationId} className={`grid grid-cols-4 gap-4 p-4 border rounded-lg ${hasError ? 'border-red-300 bg-red-50' : ''}`}>
                        <div className="grid gap-2">
                          <Label>Location</Label>
                          <div className="text-sm font-medium">
                            {store?.name || location.locationId}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`stock-${location.locationId}`}>Current Stock</Label>
                          <Input
                            id={`stock-${location.locationId}`}
                            type="number"
                            value={location.stock}
                            onChange={(e) => {
                              const newLocations = [...product.locations];
                              const index = newLocations.findIndex(loc => loc.locationId === location.locationId);
                              if (index !== -1) {
                                newLocations[index] = {
                                  ...location,
                                  stock: parseInt(e.target.value) || 0
                                };
                                setProduct({ ...product, locations: newLocations });
                              }
                            }}
                            min="0"
                            step="1"
                            autoComplete="off"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`minStock-${location.locationId}`}>Min Stock</Label>
                          <Input
                            id={`minStock-${location.locationId}`}
                            type="number"
                            value={location.minStock}
                            onChange={(e) => {
                              const newLocations = [...product.locations];
                              const index = newLocations.findIndex(loc => loc.locationId === location.locationId);
                              if (index !== -1) {
                                const minStock = parseInt(e.target.value) || 0;
                                const hasError = minStock > location.maxStock;
                                
                                newLocations[index] = {
                                  ...location,
                                  minStock,
                                  hasError,
                                  errorMessage: hasError ? 'Min stock must be less than max stock' : undefined
                                };
                                setProduct({ ...product, locations: newLocations });
                              }
                            }}
                            className={hasError ? 'border-red-500' : ''}
                            min="0"
                            step="1"
                            autoComplete="off"
                          />
                          {hasError && (
                            <p className="text-red-500 text-xs">{(location as any).errorMessage}</p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`maxStock-${location.locationId}`}>Max Stock</Label>
                          <Input
                            id={`maxStock-${location.locationId}`}
                            type="number"
                            value={location.maxStock}
                            onChange={(e) => {
                              const newLocations = [...product.locations];
                              const index = newLocations.findIndex(loc => loc.locationId === location.locationId);
                              if (index !== -1) {
                                const maxStock = parseInt(e.target.value) || 0;
                                const hasError = location.minStock > maxStock;
                                
                                newLocations[index] = {
                                  ...location,
                                  maxStock,
                                  hasError,
                                  errorMessage: hasError ? 'Min stock must be less than max stock' : undefined
                                };
                                setProduct({ ...product, locations: newLocations });
                              }
                            }}
                            className={hasError ? 'border-red-500' : ''}
                            min="0"
                            step="1"
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    );
                  }) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStoreSection;
