import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateId } from '@/lib/utils';
import type { 
  ProductVariant, 
  ProductVariantOption, 
  VariantMatrix,
  VariantOptionCombination 
} from '../types/product.types';

interface ProductVariantsManagerProps {
  variants: ProductVariant[];
  variantOptions: ProductVariantOption[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  onOptionsChange: (options: ProductVariantOption[]) => void;
}

export function ProductVariantsManager({
  variants,
  variantOptions,
  onVariantsChange,
  onOptionsChange
}: ProductVariantsManagerProps) {
  const { toast } = useToast();
  const [matrix, setMatrix] = useState<VariantMatrix>({ combinations: [], variants: [] });

  // Generate variant combinations when options change
  useEffect(() => {
    const generateCombinations = (
      options: ProductVariantOption[],
      current: VariantOptionCombination = {},
      index: number = 0
    ): VariantOptionCombination[] => {
      if (index === options.length) {
        return [current];
      }

      const combinations: VariantOptionCombination[] = [];
      const option = options[index];

      for (const value of option.values) {
        combinations.push(
          ...generateCombinations(
            options,
            { ...current, [option.name]: value },
            index + 1
          )
        );
      }

      return combinations;
    };

    const combinations = generateCombinations(variantOptions);
    const newVariants = combinations.map(combination => {
      // Find existing variant with these option values
      const existingVariant = variants.find(v => 
        v.optionValues.join(',') === Object.values(combination).join(',')
      );

      if (existingVariant) {
        return existingVariant;
      }

      // Create new variant
      return {
        id: generateId('var_'),
        sku: '',
        price: 0,
        quantity: 0,
        optionValues: Object.values(combination),
        isActive: true
      } as ProductVariant;
    });

    setMatrix({ combinations, variants: newVariants });
    onVariantsChange(newVariants);
  }, [variantOptions]);

  const handleAddOption = () => {
    const newOption: ProductVariantOption = {
      id: generateId('opt_'),
      name: '',
      values: ['']
    };
    onOptionsChange([...variantOptions, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    onOptionsChange(variantOptions.filter(opt => opt.id !== optionId));
  };

  const handleOptionNameChange = (optionId: string, name: string) => {
    onOptionsChange(
      variantOptions.map(opt =>
        opt.id === optionId ? { ...opt, name } : opt
      )
    );
  };

  const handleAddOptionValue = (optionId: string) => {
    onOptionsChange(
      variantOptions.map(opt =>
        opt.id === optionId ? { ...opt, values: [...opt.values, ''] } : opt
      )
    );
  };

  const handleOptionValueChange = (optionId: string, index: number, value: string) => {
    onOptionsChange(
      variantOptions.map(opt =>
        opt.id === optionId
          ? { ...opt, values: opt.values.map((v, i) => (i === index ? value : v)) }
          : opt
      )
    );
  };

  const handleRemoveOptionValue = (optionId: string, index: number) => {
    onOptionsChange(
      variantOptions.map(opt =>
        opt.id === optionId
          ? { ...opt, values: opt.values.filter((_, i) => i !== index) }
          : opt
      )
    );
  };

  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: any) => {
    const updatedVariants = matrix.variants.map(variant =>
      variant.id === variantId ? { ...variant, [field]: value } : variant
    );
    setMatrix({ ...matrix, variants: updatedVariants });
    onVariantsChange(updatedVariants);
  };

  return (
    <div className="space-y-6">
      {/* Variant Options */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Variant Options</h3>
          <Button onClick={handleAddOption} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>

        {variantOptions.map(option => (
          <div key={option.id} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label>Option Name</Label>
                <Input
                  value={option.name}
                  onChange={(e) => handleOptionNameChange(option.id, e.target.value)}
                  placeholder="e.g., Size, Color, Material"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(option.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Values</Label>
              {option.values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={value}
                    onChange={(e) => handleOptionValueChange(option.id, index, e.target.value)}
                    placeholder={`Value ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOptionValue(option.id, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddOptionValue(option.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Value
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Variants Table */}
      {matrix.variants.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {variantOptions.map(option => (
                  <TableHead key={option.id}>{option.name}</TableHead>
                ))}
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.variants.map((variant, index) => (
                <TableRow key={variant.id}>
                  {variant.optionValues.map((value, valueIndex) => (
                    <TableCell key={valueIndex}>{value}</TableCell>
                  ))}
                  <TableCell>
                    <Input
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                      placeholder="SKU"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(variant.id, 'price', parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={variant.quantity}
                      onChange={(e) => handleVariantChange(variant.id, 'quantity', parseInt(e.target.value))}
                      placeholder="0"
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={variant.isActive ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleVariantChange(variant.id, 'isActive', !variant.isActive)}
                    >
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 