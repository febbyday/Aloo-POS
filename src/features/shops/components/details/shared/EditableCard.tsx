import React, { ReactNode } from 'react';
import { Edit, X, Check, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EditableCardProps {
  title: string;
  icon?: ReactNode;
  isEditing: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * A reusable card component with edit/save/cancel functionality
 */
export function EditableCard({
  title,
  icon,
  isEditing,
  isSaving = false,
  onEdit,
  onCancel,
  onSave,
  children,
  className = '',
  headerClassName = 'bg-muted/30 pb-2',
  contentClassName = 'pt-4'
}: EditableCardProps) {
  return (
    <Card className={`overflow-hidden border shadow-sm ${className}`}>
      <CardHeader className={headerClassName}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-1.5 bg-primary/10 rounded-md">
                {icon}
              </div>
            )}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="ghost" size="sm" onClick={onSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}
