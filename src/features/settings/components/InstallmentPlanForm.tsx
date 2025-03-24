import { z } from "zod";
import { PaymentSettings } from "../types/settings.types";
import { FormDialog } from "@/lib/form-utils";

// Schema for installment plan validation
const installmentPlanSchema = z.object({
  period: z.object({
    frequency: z.number().min(1, "Frequency must be at least 1"),
    unit: z.enum(["day", "week", "month", "year"], {
      required_error: "Time unit is required"
    })
  }),
  priceRange: z.object({
    min: z.number().min(0, "Minimum price must be at least 0"),
    max: z.number().min(0, "Maximum price must be at least 0")
  }).refine(data => data.max > data.min, {
    message: "Maximum price must be greater than minimum price",
    path: ["max"]
  }),
  numberOfInstallments: z.number().min(1, "Number of installments must be at least 1")
});

// Type for form values
type InstallmentPlanFormValues = z.infer<typeof installmentPlanSchema>;

interface InstallmentPlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InstallmentPlanFormValues) => void;
  initialValues?: Partial<InstallmentPlanFormValues>;
}

export function InstallmentPlanForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues = {
    period: {
      frequency: 1,
      unit: "month" as const
    },
    priceRange: {
      min: 0,
      max: 1000
    },
    numberOfInstallments: 3
  }
}: InstallmentPlanFormProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Installment Plan"
      description="Configure a new installment payment plan"
      fields={[
        {
          name: "period.frequency",
          label: "Period Frequency",
          type: "number",
          min: 1,
          required: true
        },
        {
          name: "period.unit",
          label: "Period Unit",
          type: "select",
          options: [
            { label: "Day(s)", value: "day" },
            { label: "Week(s)", value: "week" },
            { label: "Month(s)", value: "month" },
            { label: "Year(s)", value: "year" }
          ],
          required: true
        },
        {
          name: "priceRange.min",
          label: "Minimum Price",
          type: "number",
          min: 0,
          required: true
        },
        {
          name: "priceRange.max",
          label: "Maximum Price",
          type: "number",
          min: 0,
          required: true
        },
        {
          name: "numberOfInstallments",
          label: "Number of Installments",
          type: "number",
          min: 1,
          required: true
        }
      ]}
      defaultValues={initialValues}
      schema={installmentPlanSchema}
      onSubmit={onSubmit}
      submitLabel="Add Plan"
      columns={2}
    />
  );
}
