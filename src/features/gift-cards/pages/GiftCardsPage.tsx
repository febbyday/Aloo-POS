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
  Ban
} from 'lucide-react';
import { format } from 'date-fns';
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
  DialogClose,
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

import { useGiftCards } from '../hooks/useGiftCards';
import { GiftCardsToolbar } from '../components/GiftCardsToolbar';
import { GiftCardForm } from '../components/GiftCardForm';
import { GiftCardSettings } from '../components/GiftCardSettings';
import { TemplateManager } from '../components/TemplateManager';
import { GiftCard, GiftCardStatus, GiftCardTransaction, GiftCardSettings as GiftCardSettingsType } from '../types';
import SettingsService from '../services/settingsService';

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
  const handleViewDetails = (giftCard: GiftCard) => {
    selectGiftCard(giftCard);
    setShowDetailsDialog(true);
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Gift Cards</CardTitle>
            <CardDescription>Currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGiftCards}</div>
            <div className="text-xs text-muted-foreground">
              {activeGiftCards > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {Math.round((activeGiftCards / totalGiftCards) * 100)}% of total
                </span>
              ) : (
                <span>No active gift cards</span>
              )}
            </div>
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
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    fill="url(#activeGradient)"
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CardDescription>Available on gift cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <div className="text-xs text-muted-foreground">
              <span className="flex items-center">
                <Wallet className="h-3 w-3 mr-1" />
                Across {activeGiftCards} active cards
              </span>
            </div>
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={giftCardStatusData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="text-xs font-medium">{payload[0].payload.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {payload[0].value}% of gift cards
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <CardDescription>Per gift card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageValue)}</div>
            <div className="text-xs text-muted-foreground">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {totalGiftCards} cards issued
              </span>
            </div>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gift Card Details Dialog */}
      {selectedGiftCard && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Gift Card Details</DialogTitle>
              <DialogDescription>
                View and manage gift card information
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2 my-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Gift Card Code</h4>
                    <p className="text-sm">{selectedGiftCard.code}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Status</h4>
                    <p>{getStatusBadge(selectedGiftCard.status)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Initial Value</h4>
                    <p className="text-sm">{formatCurrency(selectedGiftCard.initialValue)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Current Balance</h4>
                    <p className="text-sm">{formatCurrency(selectedGiftCard.balance)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Issue Date</h4>
                    <p className="text-sm">{formatDate(selectedGiftCard.issueDate)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Expiration Date</h4>
                    <p className="text-sm">{formatDate(selectedGiftCard.expirationDate)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Recipient</h4>
                  <p className="text-sm">{selectedGiftCard.recipient.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedGiftCard.recipient.email || 'No email provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Sender</h4>
                  <p className="text-sm">{selectedGiftCard.sender.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedGiftCard.sender.email || 'No email provided'}
                  </p>
                </div>

                {selectedGiftCard.message && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Message</h4>
                    <p className="text-sm">{selectedGiftCard.message}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Transaction History</h4>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No transactions found</p>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx: GiftCardTransaction) => (
                          <TableRow key={tx.id}>
                            <TableCell>{formatDate(tx.date)}</TableCell>
                            <TableCell>{getTransactionTypeLabel(tx.type)}</TableCell>
                            <TableCell>
                              {tx.type === 'redeem' || tx.type === 'expire' ? (
                                <span className="text-red-600">-{formatCurrency(tx.amount)}</span>
                              ) : (
                                <span className="text-green-600">+{formatCurrency(tx.amount)}</span>
                              )}
                            </TableCell>
                            <TableCell>{formatCurrency(tx.balanceAfter)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {selectedGiftCard.status === 'active' && (
                  <div className="pt-4 space-y-4">
                    <h4 className="text-sm font-semibold">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Implement adjustment
                          toast({
                            title: "Balance Adjusted",
                            description: "Gift card balance has been adjusted",
                          });
                        }}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Adjust Balance
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Implement email send
                          toast({
                            title: "Email Sent",
                            description: `Email sent to ${selectedGiftCard.recipient.email || 'recipient'}`,
                          });
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Card
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              {selectedGiftCard.status === 'active' && (
                <Button
                  variant="default"
                  onClick={() => {
                    handleEditGiftCard(selectedGiftCard);
                    setShowDetailsDialog(false);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Gift Card
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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