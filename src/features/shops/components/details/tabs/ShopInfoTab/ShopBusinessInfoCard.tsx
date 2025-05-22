import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { EditableCard } from '../../shared/EditableCard';
import { Shop } from '../../../../types/shops.types';

interface ShopBusinessInfoCardProps {
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
 * Card component for displaying and editing shop business information
 */
export function ShopBusinessInfoCard({
  shop,
  editMode,
  isSaving,
  editedData,
  onEnableEdit,
  onCancelEdit,
  onSaveEdit,
  onInputChange
}: ShopBusinessInfoCardProps) {
  return (
    <EditableCard
      title="Business Information"
      icon={<FileText className="h-5 w-5 text-primary" />}
      isEditing={editMode}
      isSaving={isSaving}
      onEdit={onEnableEdit}
      onCancel={onCancelEdit}
      onSave={onSaveEdit}
    >
      {!editMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="text-sm text-muted-foreground">Tax ID</div>
            <div className="text-sm font-medium">{shop?.taxId || 'Not specified'}</div>

            <div className="text-sm text-muted-foreground">License Number</div>
            <div className="text-sm font-medium">{shop?.licenseNumber || 'Not specified'}</div>

            <div className="text-sm text-muted-foreground">Timezone</div>
            <div className="text-sm font-medium">{shop?.timezone || 'UTC'}</div>

            {shop?.openedAt && (
              <>
                <div className="text-sm text-muted-foreground">Opened At</div>
                <div className="text-sm font-medium">
                  {format(new Date(shop.openedAt), 'PPP')}
                </div>
              </>
            )}

            {shop?.lastSync && (
              <>
                <div className="text-sm text-muted-foreground">Last Sync</div>
                <div className="text-sm font-medium">
                  {format(new Date(shop.lastSync), 'PPP p')}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={editedData.taxId || shop?.taxId || ''}
                onChange={(e) => onInputChange(e, 'taxId')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={editedData.licenseNumber || shop?.licenseNumber || ''}
                onChange={(e) => onInputChange(e, 'licenseNumber')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={editedData.timezone || shop?.timezone || 'UTC'}
                onChange={(e) => onInputChange(e, 'timezone')}
              />
            </div>
            {shop?.openedAt && (
              <div className="space-y-2">
                <Label htmlFor="openedAt">Opened At</Label>
                <Input
                  id="openedAt"
                  type="date"
                  value={editedData.openedAt || (shop.openedAt ? format(new Date(shop.openedAt), 'yyyy-MM-dd') : '')}
                  onChange={(e) => onInputChange(e, 'openedAt')}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </EditableCard>
  );
}
