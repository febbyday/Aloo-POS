import React from 'react';
import { Button } from '@/components/ui/button';
import { OperationButton } from "@/components/ui/action-feedback";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';

interface ProductFormHeaderProps {
  title: string;
  description: string;
  form: UseFormReturn<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onBack: () => void;
  onDelete: () => void;
  isEdit?: boolean;
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  title,
  description,
  form,
  onSubmit,
  onBack,
  onDelete,
  isEdit = false,
}) => {
  return (
    <PageHeader
      title={title}
      description={description}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          {isEdit && (
            <Button
              variant="outline"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <OperationButton
            variant="default"
            onClick={form.handleSubmit(onSubmit)}
            icon={<Save className="h-4 w-4 mr-2" />}
          >
            {isEdit ? 'Save Changes' : 'Create Product'}
          </OperationButton>
        </div>
      }
    />
  );
};

export default ProductFormHeader;
