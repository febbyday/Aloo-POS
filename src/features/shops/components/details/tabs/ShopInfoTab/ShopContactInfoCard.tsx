import React from 'react';
import { Phone, Mail, Globe } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EditableCard } from '../../shared/EditableCard';
import { Shop } from '../../../../types/shops.types';

interface ShopContactInfoCardProps {
  shop: Shop;
  editMode: boolean;
  isSaving: boolean;
  editedData: any;
  onEnableEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

/**
 * Card component for displaying and editing shop contact information
 */
export function ShopContactInfoCard({
  shop,
  editMode,
  isSaving,
  editedData,
  onEnableEdit,
  onCancelEdit,
  onSaveEdit,
  onInputChange
}: ShopContactInfoCardProps) {
  return (
    <EditableCard
      title="Contact Information"
      icon={<Phone className="h-5 w-5 text-primary" />}
      isEditing={editMode}
      isSaving={isSaving}
      onEdit={onEnableEdit}
      onCancel={onCancelEdit}
      onSave={onSaveEdit}
    >
      {!editMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="text-sm font-medium">{shop?.phone || 'Not specified'}</div>

            <div className="text-sm text-muted-foreground">Email</div>
            <div className="text-sm font-medium">{shop?.email || 'Not specified'}</div>

            {shop?.website && (
              <>
                <div className="text-sm text-muted-foreground">Website</div>
                <div className="text-sm font-medium">
                  <a 
                    href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {shop.website}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editedData.phone || shop?.phone || ''}
                onChange={(e) => onInputChange(e, 'phone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedData.email || shop?.email || ''}
                onChange={(e) => onInputChange(e, 'email')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                value={editedData.website || shop?.website || ''}
                onChange={(e) => onInputChange(e, 'website')}
              />
            </div>
          </div>
        </div>
      )}
    </EditableCard>
  );
}
