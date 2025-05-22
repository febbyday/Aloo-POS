import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar } from "lucide-react";
import { Product } from "../../types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Define the schema for the receive form
const receiveSchema = z.object({
  locationId: z.string().min(1, "Location is required"),
  quantity: z.coerce
    .number()
    .positive("Quantity must be a positive number")
    .min(1, "Quantity must be at least 1"),
  poNumber: z.string().optional(),
  notes: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
});

// Define the type for the receive values
type ReceiveValues = z.infer<typeof receiveSchema>;

// Define the props for the component
interface ReceiveStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onReceiveStock: (
    locationId: string,
    quantity: number,
    poNumber?: string,
    notes?: string,
    expectedDeliveryDate?: Date
  ) => void;
}

export function ReceiveStockDialog({
  open,
  onOpenChange,
  product,
  onReceiveStock,
}: ReceiveStockDialogProps) {
  // Initialize the form
  const form = useForm<ReceiveValues>({
    resolver: zodResolver(receiveSchema),
    defaultValues: {
      locationId: product.locations?.[0]?.id || "",
      quantity: product.reorderQuantity || 10,
      poNumber: "",
      notes: "",
      expectedDeliveryDate: undefined,
    },
  });

  // Get the selected location
  const selectedLocationId = form.watch("locationId");
  const selectedLocation = product.locations?.find(
    (loc) => loc.id === selectedLocationId || loc.locationId === selectedLocationId
  );
  const currentStock = selectedLocation?.stock || 0;
  const quantity = form.watch("quantity");

  // Calculate the new stock level
  const newStock = currentStock + quantity;

  // Handle form submission
  const onSubmit = (values: ReceiveValues) => {
    onReceiveStock(
      values.locationId,
      values.quantity,
      values.poNumber,
      values.notes,
      values.expectedDeliveryDate
    );
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Receive Stock</DialogTitle>
          <DialogDescription>
            Receive new inventory for {product.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Location Field */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {product.locations?.map((location) => (
                        <SelectItem
                          key={location.id || location.locationId}
                          value={location.id || location.locationId || ""}
                        >
                          {location.name || `Location ${location.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the location where you want to receive stock
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity Field */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? "" : value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of units to receive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PO Number Field */}
            <FormField
              control={form.control}
              name="poNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter purchase order number"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional purchase order reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expected Delivery Date Field */}
            <FormField
              control={form.control}
              name="expectedDeliveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expected Delivery Date</FormLabel>
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
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Optional expected delivery date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes for this receipt (optional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes for this stock receipt
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock Information Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stock Information</AlertTitle>
              <AlertDescription className="text-sm">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>Current Stock:</div>
                  <div className="font-medium">{currentStock}</div>
                  <div>New Stock:</div>
                  <div className="font-medium">{newStock}</div>
                  <div>Location:</div>
                  <div className="font-medium">
                    {selectedLocation?.name || `Location ${selectedLocationId}`}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Receive Stock</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
