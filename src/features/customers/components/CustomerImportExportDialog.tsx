// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileDown, 
  FileUp, 
  FileText, 
  Table2, 
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createCustomerImportTemplate } from '../utils/exportUtils';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

type ExportFormat = 'csv' | 'excel' | 'pdf';

interface CustomerImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: ExportFormat) => void;
  onFileImport: (file: File) => void;
}

export function CustomerImportExportDialog({
  open,
  onOpenChange,
  onExport,
  onFileImport
}: CustomerImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  // Handle file drop for import
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileImport(acceptedFiles[0]);
      onOpenChange(false);
    }
  }, [onFileImport, onOpenChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  // Handle export
  const handleExport = () => {
    onExport(selectedFormat);
    onOpenChange(false);
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    const workbook = createCustomerImportTemplate();
    XLSX.writeFile(workbook, 'customer_import_template.xlsx');
  };

  const exportFormats = [
    { id: 'csv', label: 'CSV', icon: Table2, description: 'Export as comma-separated values' },
    { id: 'excel', label: 'Excel', icon: FileDown, description: 'Export as Excel spreadsheet' },
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Export as PDF document' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Customer Data Management</DialogTitle>
          <DialogDescription>
            Import customers from a file or export your customer data
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <FileUp className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Drag & Drop File</h3>
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? 'Drop the file here' : 'or click to select file'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Rules</AlertTitle>
              <AlertDescription className="text-xs mt-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>File must contain the required fields: First Name, Last Name, Email</li>
                  <li>Each row represents a single customer</li>
                  <li>The first row should contain column headers</li>
                  <li>Dates should be in YYYY-MM-DD format</li>
                  <li>Tags should be comma-separated</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate}
                className="text-xs flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Download Import Template
              </Button>
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {exportFormats.map(format => {
                const Icon = format.icon;
                return (
                  <motion.div
                    key={format.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant={selectedFormat === format.id ? "default" : "outline"}
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setSelectedFormat(format.id as ExportFormat)}
                    >
                      <Icon className="h-6 w-6" />
                      <span>{format.label}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {exportFormats.find(f => f.id === selectedFormat)?.description}
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'export' && (
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 