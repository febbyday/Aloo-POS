import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Plus,
  FileText,
  Edit,
  Trash2,
  Package,
  Users,
  BarChart,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHeader from '@/components/layout/PageHeader';
import { useMarketContext } from '../context/MarketContext';
import { 
  MARKET_STATUS, 
  MarketFilter, 
} from '../types';
import { 
  MARKETS_FULL_ROUTES, 
  getMarketEditRoute, 
  getMarketStockRoute, 
  getMarketStaffRoute, 
  getMarketPerformanceRoute 
} from '@/routes/marketRoutes';

const StatusBadgeMap = {
  [MARKET_STATUS.PLANNING]: { variant: 'outline', label: 'Planning' },
  [MARKET_STATUS.PREPARING]: { variant: 'secondary', label: 'Preparing' },
  [MARKET_STATUS.ACTIVE]: { variant: 'success', label: 'Active' },
  [MARKET_STATUS.CLOSED]: { variant: 'default', label: 'Closed' },
  [MARKET_STATUS.CANCELLED]: { variant: 'destructive', label: 'Cancelled' },
};

const MarketsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    markets, 
    isLoading, 
    filters, 
    setFilters, 
    fetchMarkets,
    deleteMarket 
  } = useMarketContext();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    setFilters({
      ...filters,
      searchTerm: value,
      page: 1 // Reset to first page when searching
    });
  };

  // Handle status filter change
  const handleStatusFilter = (value: string) => {
    setFilters({
      ...filters,
      status: value === 'all' ? undefined : value as MARKET_STATUS,
      page: 1 // Reset to first page when filtering
    });
  };

  // Handle market deletion
  const handleDeleteMarket = async () => {
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteMarket(confirmDelete);
      
      if (success) {
        toast({
          title: "Market deleted",
          description: "The market has been successfully deleted",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: MARKET_STATUS) => {
    const config = StatusBadgeMap[status];
    return (
      <Badge variant={config.variant as any}>{config.label}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Markets"
        description="Manage your market events and allocations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Markets', href: MARKETS_FULL_ROUTES.ROOT },
          { label: 'All Markets', href: MARKETS_FULL_ROUTES.LIST },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>All Markets</CardTitle>
            <CardDescription>
              View and manage your markets and events
            </CardDescription>
          </div>
          <Button onClick={() => navigate(MARKETS_FULL_ROUTES.NEW)}>
            <Plus className="mr-2 h-4 w-4" /> Add Market
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={handleSearch}
                className="h-9"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select
                defaultValue="all"
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={MARKET_STATUS.PLANNING}>Planning</SelectItem>
                  <SelectItem value={MARKET_STATUS.PREPARING}>Preparing</SelectItem>
                  <SelectItem value={MARKET_STATUS.ACTIVE}>Active</SelectItem>
                  <SelectItem value={MARKET_STATUS.CLOSED}>Closed</SelectItem>
                  <SelectItem value={MARKET_STATUS.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-20rem)] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading markets...
                    </TableCell>
                  </TableRow>
                ) : markets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No markets found. Create your first market to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  markets.map((market) => (
                    <TableRow key={market.id} 
                      onClick={() => navigate(`/markets/${market.id}`)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{market.name}</TableCell>
                      <TableCell>{market.location}</TableCell>
                      <TableCell>{renderStatusBadge(market.status)}</TableCell>
                      <TableCell>
                        {format(new Date(market.startDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(market.endDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${market.progress}%` }}
                            />
                          </div>
                          <span className="w-9 text-xs">{market.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/markets/${market.id}`)
                            }}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(getMarketEditRoute(market.id as string))
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(getMarketStockRoute(market.id as string))
                            }}>
                              <Package className="mr-2 h-4 w-4" />
                              Manage Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(getMarketStaffRoute(market.id as string))
                            }}>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(getMarketPerformanceRoute(market.id as string))
                            }}>
                              <BarChart className="mr-2 h-4 w-4" />
                              Performance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(market.id as string);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this market? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMarket} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketsList; 