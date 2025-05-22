import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Product } from '../../types';

interface CategoryDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (categories: string[]) => void;
  productCategories: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
}

export function CategoryDialog({
  product,
  open,
  onOpenChange,
  onSave,
  productCategories
}: CategoryDialogProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product.category ? [product.category] : []
  );
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const filteredCategories = productCategories.filter(
    category => category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) return;

    // Check if the category already exists
    const categoryExists = productCategories.some(
      c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (!categoryExists) {
      setSelectedCategories(prev => [...prev, newCategoryName.trim()]);
      setNewCategoryName('');
      setIsAddingNewCategory(false);
    }
  };

  const handleSave = () => {
    onSave(selectedCategories);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Product Categories</DialogTitle>
          <DialogDescription>
            Assign categories to help organize and find this product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNewCategory(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>

          {isAddingNewCategory && (
            <div className="flex items-center space-x-2">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddNewCategory}>
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingNewCategory(false);
                  setNewCategoryName('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Categories</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.length > 0 ? (
                selectedCategories.map((categoryId) => {
                  const category = productCategories.find(c => c.id === categoryId);
                  return (
                    <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                      {category ? category.name : categoryId}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleToggleCategory(categoryId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">No categories selected</div>
              )}
            </div>
          </div>

          <div className="border rounded-md">
            <ScrollArea className="h-[200px]">
              <div className="p-4 grid grid-cols-1 gap-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                      selectedCategories.includes(category.id) ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleToggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {/* You can replace this with a dynamic icon component if needed */}
                        <span className="text-primary">{category.icon.substring(0, 1)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    {selectedCategories.includes(category.id) && (
                      <Badge variant="default" className="ml-auto">Selected</Badge>
                    )}
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No categories found matching "{categorySearchTerm}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Categories</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
