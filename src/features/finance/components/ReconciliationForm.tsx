import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "../context/FinanceContext";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/formatters";

// Form schema
const reconciliationFormSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
  cashInRegister: z.coerce
    .number()
    .min(0, "Amount must be a positive number")
    .default(0),
  expectedCash: z.coerce
    .number()
    .min(0, "Amount must be a positive number")
    .default(0),
  notes: z.string().optional(),
});

type ReconciliationFormValues = z.infer<typeof reconciliationFormSchema>;

interface ReconciliationFormProps {
  onSubmit: (values: ReconciliationFormValues) => void;
  defaultValues?: Partial<ReconciliationFormValues>;
  loading?: boolean;
}

export const ReconciliationForm: React.FC<ReconciliationFormProps> = ({
  onSubmit,
  defaultValues,
  loading = false,
}) => {
  const { settings } = useFinance();

  // Initialize form with default values
  const form = useForm<ReconciliationFormValues>({
    resolver: zodResolver(reconciliationFormSchema),
    defaultValues: {
      date: new Date(),
      cashInRegister: 0,
      expectedCash: 0,
      notes: "",
      ...defaultValues,
    },
  });

  // Calculate difference
  const cashInRegister = form.watch("cashInRegister") || 0;
  const expectedCash = form.watch("expectedCash") || 0;
  const difference = cashInRegister - expectedCash;

  // Use the imported formatCurrency utility

  // Handle form submission
  const handleSubmit = (values: ReconciliationFormValues) => {
    onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Reconciliation</CardTitle>
        <CardDescription>
          Reconcile your cash register with expected amounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The date of this reconciliation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cashInRegister"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cash in Register</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The actual amount of cash in the register
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedCash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Cash</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The expected amount based on sales
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Difference:</span>
                <span
                  className={cn(
                    "font-bold",
                    difference === 0
                      ? "text-green-500"
                      : difference > 0
                      ? "text-blue-500"
                      : "text-red-500"
                  )}
                >
                  {formatCurrency(difference, { currency: settings.currency })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {difference === 0
                  ? "The cash register balances perfectly."
                  : difference > 0
                  ? "There is more cash than expected (overage)."
                  : "There is less cash than expected (shortage)."}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes or explanations for discrepancies"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about this reconciliation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Reconciliation
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {settings.requireReconciliation
          ? `Reconciliation is required ${settings.reconciliationFrequency}`
          : "Reconciliation is not required but recommended"}
      </CardFooter>
    </Card>
  );
};
