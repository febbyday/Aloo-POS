import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/lib/toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { OperationButton } from "@/components/ui/action-feedback";
import { SupplierModal } from '../components/SupplierModal';
import { useSupplierHistory } from '../context/SupplierHistoryContext';
import { SupplierFormValues } from '../types';

export function SupplierAddPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = useSupplierHistory();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSubmit = (data: SupplierFormValues) => {
    try {
      // Track this action for history
      trackAction(
        { type: 'create_supplier', supplier: data as any },
        `Created supplier ${data.name}`
      );

      showToast.success('Success', 'Supplier created successfully');
      navigate('/suppliers');
    } catch (error) {
      console.error('Error creating supplier:', error);
      showToast.error('Error', 'Failed to create supplier');
    }
  };

  const handleCancel = () => {
    navigate('/suppliers');
  };

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Add New Supplier"
        description="Create a new supplier in your system"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        }
      />

      <SupplierModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            handleCancel();
          }
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
