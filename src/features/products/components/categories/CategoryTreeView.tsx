import React, { useState, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/components-index';
import { cn } from '@/lib/utils/cn';
import { Category, CategoryAttribute } from '../../types/category';

// DnD item types
const ItemTypes = {
  CATEGORY: 'category'
};

interface CategoryTreeViewProps {
  categories: Category[];
  selectedCategories: string[];
  expandedCategories: string[];
  onCategorySelect: (categoryId: string, isSelected: boolean) => void;
  onCategoryToggle: (categoryId: string) => void;
  onCategoryMove: (categoryId: string, newParentId: string | null, position: number) => void;
  onCategoryEdit: (category: Category) => void;
  onCategoryDelete: (categoryId: string) => void;
  onCategoryAdd: (parentId: string | null) => void;
  onCategoryDuplicate: (categoryId: string) => void;
  onCategoryVisibilityToggle: (categoryId: string, isVisible: boolean) => void;
  showCheckboxes?: boolean;
  showActions?: boolean;
  showProductCount?: boolean;
  maxDepth?: number;
  className?: string;
}

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  isExpanded: boolean;
  level: number;
  index: number;
  onSelect: (categoryId: string, isSelected: boolean) => void;
  onToggle: (categoryId: string) => void;
  onMove: (categoryId: string, newParentId: string | null, position: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onAdd: (parentId: string | null) => void;
  onDuplicate: (categoryId: string) => void;
  onVisibilityToggle: (categoryId: string, isVisible: boolean) => void;
  showCheckboxes?: boolean;
  showActions?: boolean;
  showProductCount?: boolean;
  maxDepth?: number;
}

interface DragItem {
  id: string;
  type: string;
  index: number;
  parentId: string | null | undefined;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isSelected,
  isExpanded,
  level,
  index,
  onSelect,
  onToggle,
  onMove,
  onEdit,
  onDelete,
  onAdd,
  onDuplicate,
  onVisibilityToggle,
  showCheckboxes = true,
  showActions = true,
  showProductCount = true,
  maxDepth = 10
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const hasChildren = category.children && category.children.length > 0;
  const isActive = category.status === 'active';

  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CATEGORY,
    item: {
      id: category.id,
      type: ItemTypes.CATEGORY,
      index,
      parentId: category.parentId
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.CATEGORY,
    canDrop: (item: DragItem) => {
      // Prevent dropping on itself or its children
      if (item.id === category.id) return false;

      // Prevent dropping if it would create a cycle
      let parent = category.parentId;
      while (parent) {
        if (parent === item.id) return false;
        const parentCategory = category.path?.find(id => id === parent);
        parent = parentCategory ? category.parentId : null;
      }

      // Prevent dropping if it would exceed max depth
      if (level >= maxDepth) return false;

      return true;
    },
    drop: (item: DragItem) => {
      if (item.id !== category.id) {
        // If dropping on a different category, make it a child
        onMove(item.id, category.id, 0);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect drag and drop refs
  drag(drop(ref));

  // Determine styles based on drag and drop state
  const opacity = isDragging ? 0.4 : 1;
  const backgroundColor = isOver && canDrop ? 'bg-primary/10' : isSelected ? 'bg-muted' : '';

  return (
    <div style={{ opacity }} className="select-none">
      <div
        ref={ref}
        className={cn(
          "flex items-center py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer",
          backgroundColor,
          isOver && !canDrop && "bg-destructive/10"
        )}
        style={{ paddingLeft: `${(level * 16) + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <div className="w-6 flex-shrink-0">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(category.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Checkbox */}
        {showCheckboxes && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(category.id, !!checked)}
            className="mr-2"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Category Icon */}
        <div className="mr-2 text-muted-foreground">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
        </div>

        {/* Category Name */}
        <div
          className="flex-1 flex items-center"
          onClick={() => onToggle(category.id)}
        >
          <span className={cn(
            "font-medium truncate",
            !isActive && "text-muted-foreground"
          )}>
            {category.name}
          </span>

          {/* Status Badge */}
          {!isActive && (
            <Badge variant="outline" className="ml-2 text-xs">Inactive</Badge>
          )}

          {/* Product Count */}
          {showProductCount && (
            <Badge variant="secondary" className="ml-2">
              {category.products} products
            </Badge>
          )}

          {/* Attributes Badge */}
          {category.attributes && category.attributes.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="ml-2 bg-primary/10">
                    {category.attributes.length} attributes
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-semibold mb-1">Category Attributes:</p>
                    <ul className="list-disc pl-4">
                      {category.attributes.map((attr: CategoryAttribute) => (
                        <li key={attr.id}>{attr.name}</li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAdd(category.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(category.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onVisibilityToggle(category.id, !isActive)}>
                {isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Render children if expanded */}
      {isExpanded && hasChildren && (
        <div>
          {category.children?.map((child, childIndex) => (
            <CategoryItem
              key={child.id}
              category={child}
              isSelected={isSelected}
              isExpanded={isExpanded}
              level={level + 1}
              index={childIndex}
              onSelect={onSelect}
              onToggle={onToggle}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              onDuplicate={onDuplicate}
              onVisibilityToggle={onVisibilityToggle}
              showCheckboxes={showCheckboxes}
              showActions={showActions}
              showProductCount={showProductCount}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({
  categories,
  selectedCategories,
  expandedCategories,
  onCategorySelect,
  onCategoryToggle,
  onCategoryMove,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  onCategoryDuplicate,
  onCategoryVisibilityToggle,
  showCheckboxes = true,
  showActions = true,
  showProductCount = true,
  maxDepth = 10,
  className
}) => {
  // Filter root categories (those without a parent)
  const rootCategories = categories.filter(category => !category.parentId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("space-y-1", className)}>
        {rootCategories.map((category, index) => (
          <CategoryItem
            key={category.id}
            category={category}
            isSelected={selectedCategories.includes(category.id)}
            isExpanded={expandedCategories.includes(category.id)}
            level={0}
            index={index}
            onSelect={onCategorySelect}
            onToggle={onCategoryToggle}
            onMove={onCategoryMove}
            onEdit={onCategoryEdit}
            onDelete={onCategoryDelete}
            onAdd={onCategoryAdd}
            onDuplicate={onCategoryDuplicate}
            onVisibilityToggle={onCategoryVisibilityToggle}
            showCheckboxes={showCheckboxes}
            showActions={showActions}
            showProductCount={showProductCount}
            maxDepth={maxDepth}
          />
        ))}

        {rootCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Categories</h3>
            <p className="text-muted-foreground mb-4">
              Create categories to organize your products.
            </p>
            <Button
              variant="outline"
              onClick={() => onCategoryAdd(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Root Category
            </Button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default CategoryTreeView;
