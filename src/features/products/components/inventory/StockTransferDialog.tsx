import { useState, useEffect } from "react";
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
import { AlertCircle } from "lucide-react";
import { Product } from "../../types";

// Define the schema for the transfer form
const transferSchema = z.object({
  fromLocationId: z.string().min(1, "Source location is required"),
  toLocationId: z.string().min(1, "Destination location is required"),
  quantity: z.coerce
    .number()
    .positive("Quantity must be a positive number")
    .min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
}).refine(data => data.fromLocationId !== data.toLocationId, {
  message: "Source and destination locations must be different",
  path: ["toLocationId"],
});

// Define the type for the transfer values
type TransferValues = z.infer<typeof transferSchema>;

// Define the props for the component
interface StockTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onTransferStock: (
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string
  ) => void;
}

export function StockTransferDialog({
  open,
  onOpenChange,
  product,
  onTransferStock,
}: StockTransferDialogProps) {
  // Initialize the form
  const form = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromLocationId: product.locations?.[0]?.id || "",
      toLocationId: "",
      quantity: 1,
      notes: "",
    },
  });

  // Get the selected locations
  const fromLocationId = form.watch("fromLocationId");
  const toLocationId = form.watch("toLocationId");
  const quantity = form.watch("quantity");

  const fromLocation = product.locations?.find(
    (loc) => loc.id === fromLocationId || loc.locationId === fromLocationId
  );
  const toLocation = product.locations?.find(
    (loc) => loc.id === toLocationId || loc.locationId === toLocationId
  );

  const currentFromStock = fromLocation?.stock || 0;
  const currentToStock = toLocation?.stock || 0;

  // Calculate the new stock levels after transfer
  const newFromStock = Math.max(0, currentFromStock - quantity);
  const newToStock = currentToStock + quantity;

  // Update max quantity based on source location stock
  useEffect(() => {
    const maxQuantity = currentFromStock;
    if (form.getValues("quantity") > maxQuantity) {
      form.setValue("quantity", maxQuantity);
    }
  }, [fromLocationId, currentFromStock, form]);

  // Handle form submission
  const onSubmit = (values: TransferValues) => {
    onTransferStock(
      values.fromLocationId,
      values.toLocationId,
      values.quantity,
      values.notes
    );
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Transfer inventory between locations for {product.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* From Location Field */}
            <FormField
              control={form.control}
              name="fromLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Location</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset toLocationId if it's the same as fromLocationId
                      if (value === form.getValues("toLocationId")) {
                        form.setValue("toLocationId", "");
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {product.locations?.map((location) => (
                        <SelectItem
                          key={`from-${location.id || location.locationId}`}
                          value={location.id || location.locationId || ""}
                          disabled={location.stock <= 0}
                        >
                          {location.name || `Location ${location.id}`} ({location.stock} units)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the location to transfer stock from
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* To Location Field */}
            <FormField
              control={form.control}
              name="toLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {product.locations?.map((location) => (
                        <SelectItem
                          key={`to-${location.id || location.locationId}`}
                          value={location.id || location.locationId || ""}
                          disabled={location.id === fromLocationId || location.locationId === fromLocationId}
                        >
                          {location.name || `Location ${location.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the location to transfer stock to
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
                      max={currentFromStock}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? "" : Math.min(value, currentFromStock));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of units to transfer (max: {currentFromStock})
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
                      placeholder="Enter notes for this transfer (optional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes for this stock transfer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock Information Alert */}
            {fromLocation && toLocation && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Transfer Information</AlertTitle>
                <AlertDescription className="text-sm">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>From Location:</div>
                    <div className="font-medium">
                      {fromLocation?.name || `Location ${fromLocationId}`}
                    </div>
                    <div>Current Stock:</div>
                    <div className="font-medium">{currentFromStock}</div>
                    <div>New Stock After Transfer:</div>
                    <div className="font-medium">{newFromStock}</div>
                    <div className="mt-2">To Location:</div>
                    <div className="font-medium mt-2">
                      {toLocation?.name || `Location ${toLocationId}`}
                    </div>
                    <div>Current Stock:</div>
                    <div className="font-medium">{currentToStock}</div>
                    <div>New Stock After Transfer:</div>
                    <div className="font-medium">{newToStock}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!fromLocationId || !toLocationId || quantity <= 0 || quantity > currentFromStock}
              >
                Transfer Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
