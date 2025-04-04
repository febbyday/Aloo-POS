import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Button,
  Input,
  Label,
  Switch,
  Badge,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui/components-index';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ProductAttribute, ProductVariation } from '../types/unified-product.types';
import AttributesManager from './AttributesManager';
import VariationsList from './VariationsList';

interface VariationsManagerProps {
  productId?: string;
  sku?: string;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  retailPrice: number;
  onAttributesChange: (attributes: ProductAttribute[]) => void;
  onVariationsChange: (variations: ProductVariation[]) => void;
}

export const VariationsManager: React.FC<VariationsManagerProps> = ({
  productId = 'new',
  sku = '',
  attributes,
  variations,
  retailPrice,
  onAttributesChange,
  onVariationsChange
}) => {
  const [generationStrategy, setGenerationStrategy] = useState<'all' | 'selected'>('all');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update selected attributes when attributes change
  useEffect(() => {
    // By default, select all attributes that are marked for variations
    const variationAttributeNames = attributes
      .filter(attr => attr.isUsedForVariations)
      .map(attr => attr.name);
    
    setSelectedAttributes(variationAttributeNames);
  }, [attributes]);

  // Generate all possible combinations of attribute values
  const generateCombinations = (attributesToUse: ProductAttribute[]) => {
    if (attributesToUse.length === 0) return [];

    // Start with first attribute's values
    let combinations: Record<string, string>[] = attributesToUse[0].values.map(value => ({
      [attributesToUse[0].name]: value
    }));

    // Add each subsequent attribute's values
    for (let i = 1; i < attributesToUse.length; i++) {
      const attribute = attributesToUse[i];
      const newCombinations: Record<string, string>[] = [];

      // For each existing combination, add each value of the current attribute
      combinations.forEach(combo => {
        attribute.values.forEach(value => {
          newCombinations.push({
            ...combo,
            [attribute.name]: value
          });
        });
      });

      combinations = newCombinations;
    }

    return combinations;
  };

  // Generate variations based on attributes
  const generateVariations = () => {
    setIsGenerating(true);
    
    try {
      // Get attributes to use for variations
      const attributesToUse = attributes.filter(attr => 
        attr.isUsedForVariations && selectedAttributes.includes(attr.name)
      );
      
      if (attributesToUse.length === 0) {
        setIsGenerating(false);
        return;
      }
      
      // Generate all combinations
      const combinations = generateCombinations(attributesToUse);
      
      // Create variations from combinations
      const newVariations: ProductVariation[] = combinations.map((combination, index) => {
        // Check if this combination already exists
        const existingVariation = variations.find(v => {
          return Object.entries(combination).every(
            ([attr, value]) => v.attributes[attr] === value
          );
        });
        
        if (existingVariation) {
          return existingVariation;
        }
        
        // Generate a unique SKU for the variation
        const baseSku = sku || `PROD-${productId}`;
        const attributeString = Object.values(combination).join('-');
        const variationSku = `${baseSku}-${attributeString}`;
        
        return {
          id: `${productId}-var-${index}`,
          attributes: combination,
          sku: variationSku,
          retailPrice: retailPrice,
          stock: 0
        };
      });
      
      onVariationsChange(newVariations);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle attribute selection for variation generation
  const toggleAttributeSelection = (attributeName: string) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attributeName)) {
        return prev.filter(name => name !== attributeName);
      } else {
        return [...prev, attributeName];
      }
    });
  };

  // Get attributes that can be used for variations
  const variationAttributes = attributes.filter(attr => attr.isUsedForVariations);

  return (
    <div className="space-y-8">
      {/* Attributes Section */}
      <AttributesManager 
        attributes={attributes}
        onChange={onAttributesChange}
      />
      
      {/* Variation Generation Section */}
      {variationAttributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Variations</CardTitle>
            <CardDescription>
              Create product variations based on attribute combinations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Attributes to use for variations</Label>
              <div className="flex flex-wrap gap-2">
                {variationAttributes.map((attribute, index) => (
                  <Badge 
                    key={index} 
                    variant={selectedAttributes.includes(attribute.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleAttributeSelection(attribute.name)}
                  >
                    {attribute.name} ({attribute.values.length})
                  </Badge>
                ))}
              </div>
            </div>
            
            {selectedAttributes.length === 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select at least one attribute to generate variations
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={generateVariations}
                disabled={selectedAttributes.length === 0 || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Variations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Variations List Section */}
      {variations.length > 0 && (
        <VariationsList 
          variations={variations}
          attributes={attributes}
          onChange={onVariationsChange}
          basePrice={retailPrice}
        />
      )}
    </div>
  );
};

export default VariationsManager;
