import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Check, 
  Clock, 
  Download, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw, 
  Search, 
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
// Update to use the factory-based service
import suppliersService from '../services/factory-suppliers-service';
import { ConnectionHistoryItem } from '../types';

interface ConnectionHistoryProps {
  isLoading: boolean;
}

export function ConnectionHistory({ isLoading }: ConnectionHistoryProps) {
  const [history, setHistory] = useState<ConnectionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ConnectionHistoryItem | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const historyData = await suppliersService.fetchConnectionHistory();
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching connection history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sync':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'test':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'config':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const displayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy, HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  const handleViewDetails = (item: ConnectionHistoryItem) => {
    setSelectedItem(item);
  };

  const paginatedHistory = history.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(history.length / rowsPerPage);

  // If exporting events to CSV or generating report
  const handleExportHistory = () => {
    // This would generate a CSV file with history events in a real implementation
    const csvContent = [
      'id,timestamp,type,status,message',
      ...history.map(item => 
        `${item.id},${item.timestamp},${item.type},${item.status},"${item.message}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `supplier-connection-history-${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            View recent connection events and synchronization history.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportHistory}
          disabled={loading || history.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
              ))
            ) : paginatedHistory.length > 0 ? (
              paginatedHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                      {displayDate(item.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="max-w-md truncate" title={item.message}>
                    {item.message}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(item)}
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No connection history available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected event
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-sm font-medium">ID</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Timestamp</h4>
                  <p className="text-sm text-muted-foreground">
                    {displayDate(selectedItem.timestamp)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Type</h4>
                  <p className="text-sm text-muted-foreground capitalize">{selectedItem.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <div>{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Message</h4>
                <p className="text-sm text-muted-foreground">{selectedItem.message}</p>
              </div>
              
              {selectedItem.details && (
                <div>
                  <h4 className="text-sm font-medium">Details</h4>
                  <pre className="bg-muted p-4 rounded-md mt-2 text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedItem.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 