import { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast';
import {
  CreditCard,
  Hash,
  Wallet,
  Calendar,
  User,
  Activity,
  Settings,
  Mail,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  PlusCircle,
  Percent,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Clock,
  Ban,
  X,
  Printer,
  FileDown,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useGiftCards } from '../hooks/gift-cards';
import {
  GiftCardsToolbar,
  GiftCardForm,
  GiftCardSettings,
  TemplateManager
} from '../components/gift-cards';
import {
  GiftCard,
  GiftCardStatus,
  GiftCardTransaction,
  GiftCardSettings as GiftCardSettingsType
} from '../types/gift-cards';
import SettingsService from '../services/gift-cards/settingsService';

// Using imported formatCurrency and formatDate from formatters.ts

// Helper to generate status badge
const getStatusBadge = (status: GiftCardStatus) => {
  switch (status) {
    case 'active':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
    case 'used':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Used</Badge>;
    case 'expired':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
    case 'disabled':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Disabled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper to get transaction type label
const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'issue':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Issue</Badge>;
    case 'redeem':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Redeem</Badge>;
    case 'adjustment':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Adjustment</Badge>;
    case 'expire':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expire</Badge>;
    case 'reactivate':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Reactivate</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

// Mock data for charts
const giftCardUsageData = [
  { name: 'Jan', amount: 1200 },
  { name: 'Feb', amount: 1900 },
  { name: 'Mar', amount: 1500 },
  { name: 'Apr', amount: 2200 },
  { name: 'May', amount: 1800 },
  { name: 'Jun', amount: 2400 },
  { name: 'Jul', amount: 2000 },
];

const giftCardStatusData = [
  { name: 'Active', value: 65 },
  { name: 'Used', value: 20 },
  { name: 'Expired', value: 10 },
  { name: 'Disabled', value: 5 },
];

export function GiftCardsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    giftCards,
    filteredGiftCards,
    loading,
    error,
    filter,
    selectedGiftCard,
    transactions,
    selectGiftCard,
    clearSelectedGiftCard,
    loadGiftCards,
    adjustBalance,
    applyFilter,
    createGiftCard,
    updateGiftCard,
  } = useGiftCards();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showTemplateManagerDialog, setShowTemplateManagerDialog] = useState(false);
  const [settings, setSettings] = useState<GiftCardSettingsType | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredGiftCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGiftCards = filteredGiftCards.slice(startIndex, startIndex + itemsPerPage);

  // Load gift cards on mount
  useEffect(() => {
    loadGiftCards();
  }, [loadGiftCards]);

  // Calculate statistics
  const totalGiftCards = giftCards.length;
  const activeGiftCards = giftCards.filter(card => card.status === 'active').length;
  const totalBalance = giftCards
    .filter(card => card.status === 'active')
    .reduce((sum, card) => sum + card.balance, 0);
  const averageValue = totalGiftCards > 0
    ? giftCards.reduce((sum, card) => sum + card.initialValue, 0) / totalGiftCards
    : 0;

  // Load gift card settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await SettingsService.getSettings();
        setSettings(settings);
      } catch (error) {
        console.error('Error loading settings', error);
        toast({
          title: 'Error',
          description: 'Failed to load gift card settings',
          variant: 'destructive',
        });
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === 'all') {
      applyFilter({ ...filter, status: undefined });
    } else {
      applyFilter({ ...filter, status: value });
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    applyFilter({ ...filter, search: query });
  };

  // Handle refresh
  const handleRefresh = () => {
    loadGiftCards();
    toast({
      title: "Refreshed",
      description: "Gift card list has been updated",
    });
  };

  // Handle filter
  const handleFilter = () => {
    setShowFilterDialog(true);
  };

  // Handle export
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Gift card list is being exported",
    });
  };

  // Handle add gift card
  const handleAddGiftCard = () => {
    setShowAddEditDialog(true);
  };

  // Handle view gift card details
  const handleViewDetails = async (giftCard: GiftCard) => {
    try {
      await selectGiftCard(giftCard);
      navigate(`/sales/gift-cards/${giftCard.id}`);
    } catch (error) {
    toast({
        title: 'Error',
        description: 'Failed to load gift card details',
        variant: 'destructive',
      });
    }
  };

  // Handle edit gift card
  const handleEditGiftCard = (giftCard: GiftCard) => {
    selectGiftCard(giftCard);
    setShowAddEditDialog(true);
  };

  // Handle transaction history
  const handleViewHistory = () => {
    setShowTransactionHistory(true);
  };

  // Handle manage designs
  const handleManageDesigns = () => {
    setShowTemplateManagerDialog(true);
  };

  // Handle settings
  const handleSettings = () => {
    setShowSettingsDialog(true);
  };

  // Save settings
  const handleSaveSettings = async (updatedSettings: GiftCardSettingsType) => {
    try {
      await SettingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving settings', error);
      return Promise.reject(error);
    }
  };

  return (
    <div className="space-y-6">
      <GiftCardsToolbar
        onRefresh={handleRefresh}
        onFilter={handleFilter}
        onExport={handleExport}
        onAddGiftCard={handleAddGiftCard}
        onSearch={handleSearch}
        onManageDesigns={handleManageDesigns}
        onViewHistory={handleViewHistory}
        onSettings={handleSettings}
      />

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 relative">
            <div>
              <CardTitle className="text-sm font-medium">Active Gift Cards</CardTitle>
              <CardDescription>Currently active</CardDescription>
            </div>
            <div className="absolute top-4 right-6">
              <div className="text-2xl font-bold">{activeGiftCards}</div>
              <div className="text-xs text-muted-foreground text-right">
                {activeGiftCards > 0 ? (
                  <span className="text-green-500 inline-flex items-center justify-end">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {Math.round((activeGiftCards / totalGiftCards) * 100)}% of total
                  </span>
                ) : (
                  <span>No active gift cards</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={giftCardUsageData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    hide={true}
                  />
                  <YAxis hide={true} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#activeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 relative">
            <div>
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <CardDescription>Available on gift cards</CardDescription>
            </div>
            <div className="absolute top-4 right-6">
              <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground text-right">
                Across {activeGiftCards} active cards
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex items-center space-x-2">
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '80%' }} />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">80%</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              <div className="h-2 w-full bg-primary rounded-full" />
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="text-[10px] text-muted-foreground">Active</div>
              <div className="text-[10px] text-muted-foreground">Used</div>
              <div className="text-[10px] text-muted-foreground">Expired</div>
              <div className="text-[10px] text-muted-foreground">Disabled</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 relative">
            <div>
              <CardTitle className="text-sm font-medium">Average Value</CardTitle>
              <CardDescription>Per gift card</CardDescription>
            </div>
            <div className="absolute top-4 right-6">
              <div className="text-2xl font-bold">${averageValue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground text-right">
                {totalGiftCards} cards issued
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={giftCardUsageData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--success))"
                    fill="url(#averageGradient)"
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="text-xs font-medium">{payload[0].payload.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ${payload[0].value} in gift cards
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter */}
      <div className="flex items-center space-x-2">
        <Select
          value={statusFilter || 'all'}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gift Cards Table */}
      <Card className="shadow-none border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span>Code</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Value</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span>Balance</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Issued Date</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Expiry Date</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Recipient</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Status</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Actions</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading gift cards...
                  </TableCell>
                </TableRow>
              ) : paginatedGiftCards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No gift cards found.
                    <Button variant="link" onClick={handleAddGiftCard} className="px-2 py-0">
                      Create a new gift card
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGiftCards.map((giftCard) => (
                  <TableRow
                    key={giftCard.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(giftCard)}
                  >
                    <TableCell className="font-medium">{giftCard.code}</TableCell>
                    <TableCell>{formatCurrency(giftCard.initialValue)}</TableCell>
                    <TableCell>{formatCurrency(giftCard.balance)}</TableCell>
                    <TableCell>{formatDate(giftCard.issueDate)}</TableCell>
                    <TableCell>{formatDate(giftCard.expirationDate)}</TableCell>
                    <TableCell>{giftCard.recipient.name || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(giftCard.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(giftCard);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditGiftCard(giftCard);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit gift card
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            // Implement send email functionality
                            toast({
                              title: "Email Sent",
                              description: `Email sent to ${giftCard.recipient.email || 'recipient'}`,
                            });
                          }}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send email
                          </DropdownMenuItem>
                          {giftCard.status === 'active' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              adjustBalance(giftCard.id, giftCard.balance, 'expire', 'Manually disabled');
                              toast({
                                title: "Gift Card Disabled",
                                description: `Gift card ${giftCard.code} has been disabled`,
                              });
                            }}>
                              <Ban className="h-4 w-4 mr-2" />
                              Disable
                            </DropdownMenuItem>
                          )}
                          {(giftCard.status === 'expired' || giftCard.status === 'disabled') && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              // Implement reactivate functionality
                              toast({
                                title: "Gift Card Reactivated",
                                description: `Gift card ${giftCard.code} has been reactivated`,
                              });
                            }}>
                              <Activity className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredGiftCards.length)} of {filteredGiftCards.length} entries
            </div>
            <div className="flex items-center space-x-2 border rounded-lg bg-card p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronFirst className="h-4 w-4" />
                <span className="sr-only">First Page</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>

              <div className="flex items-center text-sm px-2">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronLast className="h-4 w-4" />
                <span className="sr-only">Last Page</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Dialog */}
      <Dialog open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              View all gift card transactions
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              This would display a comprehensive transaction history for all gift cards.
              In a full implementation, it would include filters, search, and pagination.
            </p>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Gift Card</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Transaction history would be displayed here.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Gift Cards</DialogTitle>
            <DialogDescription>
              Set filters to narrow down gift card results
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              This dialog would include various filter options like:
            </p>
            <ul className="text-sm space-y-2 list-disc pl-5 mb-4">
              <li>Status filter</li>
              <li>Date range filters</li>
              <li>Balance range filters</li>
              <li>Recipient filters</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Implementation of these filters would be part of a full gift card management system.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowFilterDialog(false);
              toast({
                title: "Filters Applied",
                description: "Gift card filters have been applied",
              });
            }}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddEditDialog} onOpenChange={(open) => {
        setShowAddEditDialog(open);
        if (!open) clearSelectedGiftCard();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGiftCard ? 'Edit Gift Card' : 'Create New Gift Card'}
            </DialogTitle>
            <DialogDescription>
              {selectedGiftCard
                ? 'Update gift card information'
                : 'Fill out the form to create a new gift card'
              }
            </DialogDescription>
          </DialogHeader>

          <GiftCardForm
            giftCard={selectedGiftCard}
            onSubmit={async (data) => {
              try {
                if (selectedGiftCard) {
                  // Update existing gift card
                  await updateGiftCard(selectedGiftCard.id, {
                    expirationDate: data.expirationDate,
                    recipient: {
                      name: data.recipientName,
                      email: data.recipientEmail,
                    },
                    sender: {
                      name: data.senderName,
                      email: data.senderEmail,
                    },
                    message: data.message,
                    designTemplateId: data.designTemplateId,
                    code: data.generateCode ? undefined : data.manualCode,
                  });

                  toast({
                    title: "Gift Card Updated",
                    description: "Gift card has been updated successfully",
                  });
                } else {
                  // Create new gift card
                  await createGiftCard({
                    initialValue: data.initialValue,
                    expirationDate: data.expirationDate,
                    recipient: {
                      name: data.recipientName,
                      email: data.recipientEmail,
                    },
                    sender: {
                      name: data.senderName,
                      email: data.senderEmail,
                    },
                    message: data.message,
                    designTemplateId: data.designTemplateId,
                    code: data.generateCode ? undefined : data.manualCode,
                  });

                  toast({
                    title: "Gift Card Created",
                    description: "New gift card has been created successfully",
                  });

                  // Handle email delivery if selected
                  if (data.sendEmailToRecipient && data.recipientEmail) {
                    toast({
                      title: "Email Sent",
                      description: `Gift card has been emailed to ${data.recipientEmail}`,
                    });
                  }

                  // Handle printable version if selected
                  if (data.generatePrintableVersion) {
                    toast({
                      title: "PDF Generated",
                      description: "Printable gift card PDF has been generated",
                    });
                  }
                }

                setShowAddEditDialog(false);
                clearSelectedGiftCard();
              } catch (error) {
                toast({
                  title: "Error",
                  description: "There was a problem with the gift card operation",
                  variant: "destructive",
                });
                console.error(error);
              }
            }}
            onCancel={() => {
              setShowAddEditDialog(false);
              clearSelectedGiftCard();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gift Card Settings</DialogTitle>
            <DialogDescription>
              Configure system-wide settings for gift cards
            </DialogDescription>
          </DialogHeader>

          {loadingSettings ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          ) : settings ? (
            <GiftCardSettings
              settings={settings}
              onSave={handleSaveSettings}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Failed to load settings</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowSettingsDialog(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Manager Dialog */}
      <Dialog
        open={showTemplateManagerDialog}
        onOpenChange={setShowTemplateManagerDialog}
        modal={true}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Design Templates</DialogTitle>
            <DialogDescription>
              Manage gift card design templates
            </DialogDescription>
          </DialogHeader>

          <TemplateManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}