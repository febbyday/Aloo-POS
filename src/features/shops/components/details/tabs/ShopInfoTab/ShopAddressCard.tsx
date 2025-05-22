import React from 'react';
import { MapPin } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EditableCard } from '../../shared/EditableCard';
import { Shop } from '../../../../types/shops.types';

interface ShopAddressCardProps {
  shop: Shop;
  editMode: boolean;
  isSaving: boolean;
  editedData: any;
  onEnableEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: string, nestedField: string) => void;
}

/**
 * Card component for displaying and editing shop address
 */
export function ShopAddressCard({
  shop,
  editMode,
  isSaving,
  editedData,
  onEnableEdit,
  onCancelEdit,
  onSaveEdit,
  onInputChange
}: ShopAddressCardProps) {
  const address = shop?.address || {};
  const editedAddress = editedData?.address || {};

  return (
    <EditableCard
      title="Address"
      icon={<MapPin className="h-5 w-5 text-primary" />}
      isEditing={editMode}
      isSaving={isSaving}
      onEdit={onEnableEdit}
      onCancel={onCancelEdit}
      onSave={onSaveEdit}
    >
      {!editMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="text-sm text-muted-foreground">Street</div>
            <div className="text-sm font-medium">{address.street || 'Not specified'}</div>

            {address.street2 && (
              <>
                <div className="text-sm text-muted-foreground">Street 2</div>
                <div className="text-sm font-medium">{address.street2}</div>
              </>
            )}

            <div className="text-sm text-muted-foreground">City</div>
            <div className="text-sm font-medium">{address.city || 'Not specified'}</div>

            <div className="text-sm text-muted-foreground">State/Province</div>
            <div className="text-sm font-medium">{address.state || 'Not specified'}</div>

            <div className="text-sm text-muted-foreground">Postal Code</div>
            <div className="text-sm font-medium">{address.postalCode || 'Not specified'}</div>

            <div className="text-sm text-muted-foreground">Country</div>
            <div className="text-sm font-medium">{address.country || 'Not specified'}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                value={editedAddress.street || address.street || ''}
                onChange={(e) => onInputChange(e, 'address', 'street')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street2">Street 2 (Optional)</Label>
              <Input
                id="street2"
                value={editedAddress.street2 || address.street2 || ''}
                onChange={(e) => onInputChange(e, 'address', 'street2')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editedAddress.city || address.city || ''}
                  onChange={(e) => onInputChange(e, 'address', 'city')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={editedAddress.state || address.state || ''}
                  onChange={(e) => onInputChange(e, 'address', 'state')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={editedAddress.postalCode || address.postalCode || ''}
                  onChange={(e) => onInputChange(e, 'address', 'postalCode')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editedAddress.country || address.country || ''}
                  onChange={(e) => onInputChange(e, 'address', 'country')}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </EditableCard>
  );
}
