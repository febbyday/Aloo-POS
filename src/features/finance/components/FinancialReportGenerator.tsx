import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { CalendarIcon, FileDown, FileText, Loader2 } from "lucide-react";
import { ReportType } from "../types/finance.types";

// Form schema
const reportFormSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  type: z.enum(["sales", "expenses", "profit_loss", "tax", "reconciliation", "custom"], {
    required_error: "Please select a report type",
  }),
  dateRange: z.object({
    from: z.date({
      required_error: "Start date is required",
    }),
    to: z.date({
      required_error: "End date is required",
    }),
  }).refine(data => data.from <= data.to, {
    message: "End date cannot be before start date",
    path: ["to"],
  }),
  format: z.enum(["pdf", "csv", "excel"], {
    required_error: "Please select a file format",
  }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface FinancialReportGeneratorProps {
  onGenerate: (values: ReportFormValues) => Promise<void>;
}

export const FinancialReportGenerator: React.FC<FinancialReportGeneratorProps> = ({
  onGenerate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize form with default values
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      name: "",
      type: "sales",
      dateRange: {
        from: new Date(new Date().setDate(1)), // First day of current month
        to: new Date(),
      },
      format: "pdf",
    },
  });

  // Report type options
  const reportTypes = [
    { value: "sales", label: "Sales Report" },
    { value: "expenses", label: "Expense Report" },
    { value: "profit_loss", label: "Profit & Loss Report" },
    { value: "tax", label: "Tax Report" },
    { value: "reconciliation", label: "Reconciliation Report" },
    { value: "custom", label: "Custom Report" },
  ];

  // Format options
  const formatOptions = [
    { value: "pdf", label: "PDF Document", icon: "FileText" },
    { value: "csv", label: "CSV Spreadsheet", icon: "FileDown" },
    { value: "excel", label: "Excel Spreadsheet", icon: "FileDown" },
  ];

  // Handle form submission
  const handleSubmit = async (values: ReportFormValues) => {
    try {
      setIsGenerating(true);
      await onGenerate(values);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Financial Report
        </CardTitle>
        <CardDescription>
          Create customized financial reports for your business
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Sales Report" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of financial report to generate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Date Range</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateRange.from"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="sr-only">From Date</FormLabel>
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
                                <span>Pick a start date</span>
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
                      <FormDescription>Start date</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateRange.to"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="sr-only">To Date</FormLabel>
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
                                <span>Pick an end date</span>
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
                      <FormDescription>End date</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>
                The time period to include in the report
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a file format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formatOptions.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex items-center gap-2">
                            {format.icon === "FileText" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <FileDown className="h-4 w-4" />
                            )}
                            {format.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The file format for your report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Reports are generated with the most recent data available
      </CardFooter>
    </Card>
  );
};
