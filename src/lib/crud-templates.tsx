import React, { useState, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit, X } from "lucide-react";

export interface CrudColumn<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  cell?: (item: T) => React.ReactNode;
  enableSorting?: boolean;
}

export interface CrudAction<T> {
  label: string;
  icon: React.ElementType;
  onClick: (item: T) => void;
  condition?: (item: T) => boolean;
}

export interface CrudTemplateProps<T> {
  title: string;
  description?: string;
  items: T[];
  columns: CrudColumn<T>[];
  actions?: CrudAction<T>[];
  primaryKey: keyof T;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  addButtonLabel?: string;
  emptyStateMessage?: string;
  disableAdd?: boolean;
  loading?: boolean;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export function CrudTemplate<T>({
  title,
  description,
  items,
  columns,
  actions = [],
  primaryKey,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  searchPlaceholder = "Search...",
  addButtonLabel = "Add New",
  emptyStateMessage = "No items found",
  disableAdd = false,
  loading = false,
  pagination,
}: CrudTemplateProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  }, [onSearch]);

  const handleDeleteClick = useCallback((item: T) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, onDelete]);

  const defaultActions: CrudAction<T>[] = [
    ...(onEdit ? [{
      label: "Edit",
      icon: Edit,
      onClick: onEdit
    }] : []),
    ...(onDelete ? [{
      label: "Delete",
      icon: Trash2,
      onClick: handleDeleteClick
    }] : [])
  ];

  const allActions = [...defaultActions, ...actions];

  const renderCell = (item: T, column: CrudColumn<T>) => {
    if (column.cell) {
      return column.cell(item);
    }
    
    if (typeof column.accessorKey === 'function') {
      return column.accessorKey(item);
    }
    
    const value = item[column.accessorKey as keyof T];
    return value as React.ReactNode;
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { pageSize, currentPage, totalItems, onPageChange } = pagination;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    return (
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            )}
            {onAdd && (
              <Button onClick={onAdd} disabled={disableAdd}>
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index}>
                      {column.header}
                    </TableHead>
                  ))}
                  {allActions.length > 0 && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={String(item[primaryKey])}>
                    {columns.map((column, index) => (
                      <TableCell key={index}>
                        {renderCell(item, column)}
                      </TableCell>
                    ))}
                    {allActions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {allActions.map((action, index) => (
                            (!action.condition || action.condition(item)) && (
                              <Button
                                key={index}
                                variant="ghost"
                                size="icon"
                                onClick={() => action.onClick(item)}
                                title={action.label}
                              >
                                {React.createElement(action.icon, { className: "h-4 w-4" })}
                              </Button>
                            )
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <X className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{emptyStateMessage}</h3>
            {onAdd && (
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={onAdd}
                disabled={disableAdd}
              >
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            This action cannot be undone. This will permanently delete the item and remove its data from our servers.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export interface DetailViewProps<T> {
  title: string;
  description?: string;
  item: T;
  sections: {
    title: string;
    fields: {
      label: string;
      value: React.ReactNode;
      icon?: React.ElementType;
    }[];
  }[];
  actions?: {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];
}

export function DetailView<T>({
  title,
  description,
  item,
  sections,
  actions = [],
}: DetailViewProps<T>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                >
                  {React.createElement(action.icon, { className: "mr-2 h-4 w-4" })}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h3 className="text-lg font-medium">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex items-start gap-2">
                    {field.icon && React.createElement(field.icon, { className: "h-4 w-4 mt-1 text-muted-foreground" })}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">{field.label}</div>
                      <div>{field.value || <span className="text-muted-foreground italic">Not provided</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
