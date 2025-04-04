// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useState, useEffect } from 'react';
import { PageHeader, OperationButton } from '@/components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Save,
  Grid,
  Tag
} from 'lucide-react';
import { useToastManager } from '@/components/ui/toast-manager';
import { useProducts } from '../context/ProductContext';
import { ProductAttribute } from '../types/unified-product.types';
import AttributesManager from '../components/AttributesManager';
import VariationTemplateManager from '../components/variations/VariationTemplateManager';

/**
 * VariationsManagerPage Component
 *
 * This page provides a centralized interface for managing product attributes and variations
 * across the entire product catalog.
 */
export const VariationsManagerPage: React.FC = () => {

  const showToast = useToastManager();
  const { attributes, saveAttributes, loading } = useProducts();
  const [globalAttributes, setGlobalAttributes] = useState<ProductAttribute[]>([]);
  const [activeTab, setActiveTab] = useState('attributes');

  // Load global attributes on component mount
  useEffect(() => {
    if (attributes) {
      setGlobalAttributes(attributes);
    }
  }, [attributes]);

  // Handle saving global attributes
  const handleSaveAttributes = async () => {
    try {
      await saveAttributes(globalAttributes);
      showToast.success('Success', 'Global attributes saved successfully');
    } catch (error) {
      showToast.error('Error', 'Failed to save global attributes');
      console.error('Error saving attributes:', error);
    }
  };

  return (
    <div className="w-full pb-6 space-y-4">
      <PageHeader
        title="Variations & Attributes Manager"
        description="Manage product attributes and variations across your catalog"
        actions={
          <div className="flex items-center gap-2">
            <OperationButton
              variant="default"
              onClick={handleSaveAttributes}
              icon={<Save className="h-4 w-4 mr-2" />}
              disabled={loading}
            >
              Save Changes
            </OperationButton>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 w-[400px]">
          <TabsTrigger value="attributes">
            <Tag className="h-4 w-4 mr-2" />
            Global Attributes
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Grid className="h-4 w-4 mr-2" />
            Variation Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attributes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Attributes</CardTitle>
              <CardDescription>
                Define attributes that can be used across multiple products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttributesManager
                attributes={globalAttributes}
                onChange={setGlobalAttributes}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Use Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Creating Attributes</h3>
                <p className="text-sm text-muted-foreground">
                  Create attributes like Size, Color, Material, etc. with their possible values.
                  These attributes can then be used to create product variations.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Using Attributes in Products</h3>
                <p className="text-sm text-muted-foreground">
                  When creating or editing a variable product, you can select from these global attributes
                  or create product-specific attributes.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Generating Variations</h3>
                <p className="text-sm text-muted-foreground">
                  Once attributes are added to a product, you can generate variations based on
                  combinations of attribute values (e.g., Small-Red, Medium-Blue, etc.).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variation Templates</CardTitle>
              <CardDescription>
                Create and manage reusable variation templates for common product types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Integrate the VariationTemplateManager component */}
              <VariationTemplateManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VariationsManagerPage;
