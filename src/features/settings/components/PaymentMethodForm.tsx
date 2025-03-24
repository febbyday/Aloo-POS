import { z } from "zod";
import { PaymentMethod } from "../types/settings.types";
import { FormDialog } from "@/lib/form-utils";
import { paymentMethodIcons } from "../services/payment-service";

// Schema for payment method validation
const paymentMethodSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
  icon: z.string().min(1, "Icon is required"),
  enabled: z.boolean().default(true),
  systemDefined: z.boolean().default(false),
  settings: z.record(z.string(), z.union([z.string(), z.boolean()])).default({})
});

// Type for form values
type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PaymentMethodFormValues) => void;
  initialValues?: Partial<PaymentMethodFormValues>;
  title: string;
  isEditing: boolean;
}

export function PaymentMethodForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues = {
    name: "",
    icon: "credit-card",
    enabled: true,
    systemDefined: false,
    settings: {}
  },
  title,
  isEditing
}: PaymentMethodFormProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={isEditing ? "Edit payment method details" : "Add a new payment method"}
      fields={[
        {
          name: "name",
          label: "Method Name",
          type: "text",
          placeholder: "e.g. Credit Card, Cash, etc.",
          required: true
        },
        {
          name: "icon",
          label: "Icon",
          type: "select",
          options: paymentMethodIcons.map(icon => ({
            label: icon.label,
            value: icon.value
          })),
          required: true
        },
        {
          name: "enabled",
          label: "Enabled",
          type: "switch",
          description: "Allow customers to use this payment method"
        },
        {
          name: "systemDefined",
          label: "System Defined",
          type: "switch",
          description: "System-defined methods cannot be deleted",
          disabled: true,
          hidden: !isEditing
        }
      ]}
      defaultValues={initialValues}
      schema={paymentMethodSchema}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Update" : "Add"}
    />
  );
}
