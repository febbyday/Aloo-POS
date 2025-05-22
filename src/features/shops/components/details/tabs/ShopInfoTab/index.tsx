import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { ShopDetailsCard } from './ShopDetailsCard';
import { ShopAddressCard } from './ShopAddressCard';
import { ShopBusinessInfoCard } from './ShopBusinessInfoCard';
import { ShopContactInfoCard } from './ShopContactInfoCard';
import { ShopOperatingHoursCard } from './ShopOperatingHoursCard';
import { Shop } from '../../../../types/shops.types';

interface ShopInfoTabProps {
  shop: Shop;
  updateShop: (data: Partial<Shop>) => Promise<Shop | null>;
}

/**
 * Component for the Info tab in shop details
 */
export function ShopInfoTab({ shop, updateShop }: ShopInfoTabProps) {
  const { toast } = useToast();
  
  // State for edit modes
  const [editMode, setEditMode] = useState({
    shopDetails: false,
    address: false,
    businessInfo: false,
    contactInfo: false,
    operatingHours: false
  });
  
  // State for saving status
  const [isSaving, setIsSaving] = useState(false);
  
  // State for edited data
  const [editedData, setEditedData] = useState<Partial<Shop>>({});

  // Handler for enabling edit mode for a specific section
  const handleEnableEditMode = (section: keyof typeof editMode) => {
    setEditMode(prev => ({ ...prev, [section]: true }));
    setEditedData(shop || {});
  };

  // Handler for canceling edit mode for a specific section
  const handleCancelEdit = (section: keyof typeof editMode) => {
    setEditMode(prev => ({ ...prev, [section]: false }));
    setEditedData({});
  };

  // Handler for saving edits for a specific section
  const handleSaveEdit = async (section: keyof typeof editMode) => {
    if (!shop) return;

    try {
      setIsSaving(true);

      // Create a partial update with just the relevant fields
      const updateData: Partial<Shop> = {};
      
      switch (section) {
        case 'shopDetails':
          updateData.code = editedData.code;
          updateData.type = editedData.type;
          updateData.isHeadOffice = editedData.isHeadOffice;
          break;
        case 'address':
          updateData.address = editedData.address;
          break;
        case 'businessInfo':
          updateData.taxId = editedData.taxId;
          updateData.licenseNumber = editedData.licenseNumber;
          updateData.timezone = editedData.timezone;
          updateData.openedAt = editedData.openedAt;
          break;
        case 'contactInfo':
          updateData.phone = editedData.phone;
          updateData.email = editedData.email;
          updateData.website = editedData.website;
          break;
        case 'operatingHours':
          updateData.operatingHours = editedData.operatingHours;
          break;
      }

      // Update the shop
      await updateShop(updateData);

      // Reset edit mode
      setEditMode(prev => ({ ...prev, [section]: false }));
      setEditedData({});

      toast({
        title: "Changes Saved",
        description: `${section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')} updated successfully.`,
      });
    } catch (error) {
      console.error(`Failed to update ${section}:`, error);

      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : `Could not update ${section}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, 
    field: string, 
    nestedField?: string
  ) => {
    const value = e.target.value;

    if (nestedField) {
      // Handle nested fields (e.g., address.street)
      setEditedData(prev => ({
        ...prev,
        [field]: {
          ...((prev as any)?.[field] || (shop as any)?.[field] || {}),
          [nestedField]: value
        }
      }));
    } else {
      // Handle top-level fields
      setEditedData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handler for select changes
  const handleSelectChange = (value: string, field: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler for operating hours changes
  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setEditedData(prev => {
      const currentHours = prev.operatingHours || shop.operatingHours || {};
      const currentDayHours = currentHours[day as keyof typeof currentHours] || { open: false };
      
      return {
        ...prev,
        operatingHours: {
          ...currentHours,
          [day]: {
            ...currentDayHours,
            [field]: value
          }
        }
      };
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Column - Shop Details, Address, Business Information */}
      <div className="space-y-4">
        <ShopDetailsCard
          shop={shop}
          editMode={editMode.shopDetails}
          isSaving={isSaving}
          editedData={editedData}
          onEnableEdit={() => handleEnableEditMode('shopDetails')}
          onCancelEdit={() => handleCancelEdit('shopDetails')}
          onSaveEdit={() => handleSaveEdit('shopDetails')}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
        />
        
        <ShopAddressCard
          shop={shop}
          editMode={editMode.address}
          isSaving={isSaving}
          editedData={editedData}
          onEnableEdit={() => handleEnableEditMode('address')}
          onCancelEdit={() => handleCancelEdit('address')}
          onSaveEdit={() => handleSaveEdit('address')}
          onInputChange={handleInputChange}
        />
        
        <ShopBusinessInfoCard
          shop={shop}
          editMode={editMode.businessInfo}
          isSaving={isSaving}
          editedData={editedData}
          onEnableEdit={() => handleEnableEditMode('businessInfo')}
          onCancelEdit={() => handleCancelEdit('businessInfo')}
          onSaveEdit={() => handleSaveEdit('businessInfo')}
          onInputChange={handleInputChange}
        />
      </div>
      
      {/* Right Column - Contact Information, Operating Hours */}
      <div className="space-y-4">
        <ShopContactInfoCard
          shop={shop}
          editMode={editMode.contactInfo}
          isSaving={isSaving}
          editedData={editedData}
          onEnableEdit={() => handleEnableEditMode('contactInfo')}
          onCancelEdit={() => handleCancelEdit('contactInfo')}
          onSaveEdit={() => handleSaveEdit('contactInfo')}
          onInputChange={handleInputChange}
        />
        
        <ShopOperatingHoursCard
          shop={shop}
          editMode={editMode.operatingHours}
          isSaving={isSaving}
          editedData={editedData}
          onEnableEdit={() => handleEnableEditMode('operatingHours')}
          onCancelEdit={() => handleCancelEdit('operatingHours')}
          onSaveEdit={() => handleSaveEdit('operatingHours')}
          onOperatingHoursChange={handleOperatingHoursChange}
        />
      </div>
    </div>
  );
}
