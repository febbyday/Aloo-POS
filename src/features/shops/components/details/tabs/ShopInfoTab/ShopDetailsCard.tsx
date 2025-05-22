import React from 'react';
import { Building2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditableCard } from '../../shared/EditableCard';
import { Shop } from '../../../../types/shops.types';

interface ShopDetailsCardProps {
  shop: Shop;
  editMode: boolean;
  isSaving: boolean;
  editedData: any;
  onEnableEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => void;
  onSelectChange: (value: string, field: string) => void;
}

/**
 * Card component for displaying and editing basic shop details
 */
export function ShopDetailsCard({
  shop,
  editMode,
  isSaving,
  editedData,
  onEnableEdit,
  onCancelEdit,
  onSaveEdit,
  onInputChange,
  onSelectChange
}: ShopDetailsCardProps) {
  return (
    <EditableCard
      title="Shop Details"
      icon={<Building2 className="h-5 w-5 text-primary" />}
      isEditing={editMode}
      isSaving={isSaving}
      onEdit={onEnableEdit}
      onCancel={onCancelEdit}
      onSave={onSaveEdit}
    >
      {!editMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="text-sm text-muted-foreground">Shop Code</div>
            <div className="text-sm font-medium">{shop?.code || 'Not specified'}</div>

            <div className="text-sm text-muted-foreground">Type</div>
            <div className="text-sm font-medium capitalize">{shop?.type?.toLowerCase() || 'Not specified'}</div>

            {shop?.isHeadOffice && (
              <div className="col-span-2 mt-1">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
                  Head Office
                </Badge>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop-code">Shop Code</Label>
              <Input
                id="shop-code"
                value={editedData.code || shop?.code || ''}
                onChange={(e) => onInputChange(e, 'code')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-type">Shop Type</Label>
              <Select
                value={editedData.type || shop?.type || ''}
                onValueChange={(value) => onSelectChange(value, 'type')}
              >
                <SelectTrigger id="shop-type">
                  <SelectValue placeholder="Select shop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RETAIL">Retail</SelectItem>
                  <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                  <SelectItem value="OUTLET">Outlet</SelectItem>
                  <SelectItem value="KIOSK">Kiosk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </EditableCard>
  );
}
