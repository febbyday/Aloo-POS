// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { parseShopImportCsv, downloadShopImportTemplate, ShopImportData } from '../services/shopImportService';

interface ShopImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ShopImportData[]) => void;
}

export function ShopImportDialog({ isOpen, onClose, onImport }: ShopImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0] || null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a CSV file to import');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Read file content
      const fileContent = await file.text();
      
      // Set up event listener for validation warnings
      const originalWarn = console.warn;
      console.warn = (...args) => {
        originalWarn(...args);
        
        // Check if this is our specific validation warning message
        const message = args[0];
        if (typeof message === 'string' && message.includes('rows had validation errors and were skipped')) {
          // Show toast with warning
          setTimeout(() => {
            toast({
              title: "Import completed with warnings",
              description: message,
              variant: "warning",
            });
          }, 500);
        }
      };
      
      // Parse CSV file
      const importData = await parseShopImportCsv(fileContent);
      
      // Restore original console.warn
      console.warn = originalWarn;
      
      // Show success message with import count
      toast({
        title: "Import Successful",
        description: `Successfully imported ${importData.length} shops.`,
      });
      
      // Pass data to parent component
      onImport(importData);
      
      // Reset and close
      setFile(null);
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadShopImportTemplate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Shops</DialogTitle>
        </DialogHeader>
        
        <Alert className="my-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Import Format</AlertTitle>
          <AlertDescription>
            <p className="text-sm mb-2">
              Your CSV file must follow our template format exactly. Common issues:
            </p>
            <ul className="text-xs list-disc pl-5 space-y-1">
              <li>Ensure your columns match our template exactly</li>
              <li>Double-check type & status values</li>
              <li>Watch for extra quotes or commas</li>
            </ul>
            <Button 
              variant="link" 
              className="text-xs p-0 h-auto mt-1" 
              onClick={() => setShowFormatting(!showFormatting)}
            >
              {showFormatting ? "Hide formatting details" : "Show formatting details"}
            </Button>
            
            {showFormatting && (
              <div className="mt-2 border rounded-md p-2 bg-muted/20 text-xs">
                <p className="font-bold">Required columns:</p>
                <ul className="list-disc pl-5 space-y-1 my-1">
                  <li><span className="font-semibold">name</span> - Shop name (required)</li>
                  <li><span className="font-semibold">location</span> - Shop address (required)</li>
                  <li><span className="font-semibold">type</span> - Must be: retail, warehouse, or outlet (required)</li>
                  <li><span className="font-semibold">status</span> - Must be: active, inactive, or maintenance</li>
                </ul>
                <p className="font-bold mt-2">Optional columns:</p>
                <ul className="list-disc pl-5 space-y-1 my-1">
                  <li><span className="font-semibold">phone</span> - Contact phone number</li>
                  <li><span className="font-semibold">email</span> - Contact email</li>
                  <li><span className="font-semibold">managerName</span> - Shop manager</li>
                  <li><span className="font-semibold">notes</span> - Additional information</li>
                </ul>
                <div className="mt-2">
                  <p className="font-bold">Example CSV format:</p>
                  <pre className="bg-muted p-1 mt-1 overflow-auto text-[10px] leading-tight">
                    name,location,type,status,phone,email<br/>
                    Main Shop,"123 Main St",retail,active,"555-1234",shop@example.com<br/>
                    Warehouse,"456 Industrial Ave",warehouse,active
                  </pre>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="my-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Upload CSV File</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </div>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 my-2"
          />
          {file && (
            <p className="text-sm mt-1">Selected file: {file.name}</p>
          )}
          {error && (
            <div className="text-destructive text-sm mt-2 bg-destructive/10 p-2 rounded border border-destructive/20 whitespace-pre-line">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isLoading}
          >
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
