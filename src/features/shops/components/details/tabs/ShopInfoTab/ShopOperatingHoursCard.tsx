import React from 'react';
import { Clock } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EditableCard } from '../../shared/EditableCard';
import { Shop, OperatingHours } from '../../../../types/shops.types';

interface ShopOperatingHoursCardProps {
  shop: Shop;
  editMode: boolean;
  isSaving: boolean;
  editedData: any;
  onEnableEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onOperatingHoursChange: (day: string, field: string, value: any) => void;
}

/**
 * Card component for displaying and editing shop operating hours
 */
export function ShopOperatingHoursCard({
  shop,
  editMode,
  isSaving,
  editedData,
  onEnableEdit,
  onCancelEdit,
  onSaveEdit,
  onOperatingHoursChange
}: ShopOperatingHoursCardProps) {
  const operatingHours = shop?.operatingHours || {
    monday: { open: false, openTime: '', closeTime: '' },
    tuesday: { open: false, openTime: '', closeTime: '' },
    wednesday: { open: false, openTime: '', closeTime: '' },
    thursday: { open: false, openTime: '', closeTime: '' },
    friday: { open: false, openTime: '', closeTime: '' },
    saturday: { open: false, openTime: '', closeTime: '' },
    sunday: { open: false, openTime: '', closeTime: '' }
  };

  const editedHours = editedData?.operatingHours || {};

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const formatTime = (time: string | null | undefined) => {
    if (!time) return 'Closed';
    return time;
  };

  return (
    <EditableCard
      title="Operating Hours"
      icon={<Clock className="h-5 w-5 text-primary" />}
      isEditing={editMode}
      isSaving={isSaving}
      onEdit={onEnableEdit}
      onCancel={onCancelEdit}
      onSave={onSaveEdit}
    >
      {!editMode ? (
        <div className="space-y-2">
          {days.map(day => {
            const dayHours = operatingHours[day.key as keyof OperatingHours];
            return (
              <div key={day.key} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                <div className="text-sm font-medium">{day.label}</div>
                {dayHours?.open ? (
                  <div className="col-span-2 text-sm">
                    {formatTime(dayHours.openTime)} - {formatTime(dayHours.closeTime)}
                    {dayHours.breakStart && dayHours.breakEnd && (
                      <span className="text-muted-foreground ml-2">
                        (Break: {formatTime(dayHours.breakStart)} - {formatTime(dayHours.breakEnd)})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="col-span-2 text-sm text-muted-foreground">Closed</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {days.map(day => {
            const dayKey = day.key as keyof OperatingHours;
            const dayHours = operatingHours[dayKey];
            const editedDayHours = editedHours[dayKey] || {};
            const isOpen = editedDayHours.open !== undefined ? editedDayHours.open : dayHours?.open || false;
            
            return (
              <div key={day.key} className="space-y-2 pb-4 border-b last:border-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${day.key}-open`} className="font-medium">
                    {day.label}
                  </Label>
                  <Switch
                    id={`${day.key}-open`}
                    checked={isOpen}
                    onCheckedChange={(checked) => onOperatingHoursChange(day.key, 'open', checked)}
                  />
                </div>
                
                {isOpen && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${day.key}-open-time`}>Open Time</Label>
                      <Input
                        id={`${day.key}-open-time`}
                        type="time"
                        value={editedDayHours.openTime || dayHours?.openTime || ''}
                        onChange={(e) => onOperatingHoursChange(day.key, 'openTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${day.key}-close-time`}>Close Time</Label>
                      <Input
                        id={`${day.key}-close-time`}
                        type="time"
                        value={editedDayHours.closeTime || dayHours?.closeTime || ''}
                        onChange={(e) => onOperatingHoursChange(day.key, 'closeTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </EditableCard>
  );
}
