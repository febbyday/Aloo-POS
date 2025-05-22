import { useState } from 'react';
import {
  Button
} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Badge
} from '@/components/ui/badge';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Switch
} from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Star,
  Award,
  Gift,
  Settings,
  PlusCircle,
  Trash2,
  Edit,
  Users,
  Save,
  AlertCircle,
  CircleDollarSign,
  Calendar,
  Settings2,
  Plus,
  UserCheck,
  Activity,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/lib/toast';
import { useCustomers } from '../hooks/useCustomers';
import { useLoyaltyProgram } from '../hooks/useLoyaltyProgram';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { LoyaltyTier, LoyaltyReward, LoyaltyEvent, LoyaltySettings } from '../types/customers.types';
import { Skeleton } from '@/components/ui/skeleton';
import { DonutChart, BarChart, LineChart } from '@tremor/react';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { ErrorBoundary } from '@/components/unified-error-boundary';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

function ErrorFallback(error: Error, reset: () => void) {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Something went wrong:</h2>
      <pre className="text-sm bg-white dark:bg-zinc-900 p-4 rounded border overflow-auto mb-4">
        {error.message}
      </pre>
      <Button onClick={reset} variant="outline">
        Try Again
      </Button>
    </div>
  );
}

export function LoyaltyProgramPage() {
  // State for loyalty program
  const [activeTab, setActiveTab] = useState('tiers');
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<LoyaltyEvent | null>(null);
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Integration with existing customer data
  const { customers } = useCustomers();
  const { toast } = useToast();

  // Use our loyalty program hook for data management
  const {
    tiers,
    rewards,
    events,
    settings,
    loading,
    createTier,
    updateTier,
    deleteTier,
    createReward,
    updateReward,
    deleteReward,
    createEvent,
    updateEvent,
    deleteEvent,
    updateSettings,
    isLoading,
    error,
    fetchSettings
  } = useLoyaltyProgram();

  // Stats for the dashboard
  const totalCustomers = customers.length;
  const customersWithPoints = customers.filter(c => c.loyaltyPoints > 0).length;
  const totalPointsIssued = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  // Handlers for tiers
  const handleAddTier = () => {
    setSelectedTier(null);
    setTierDialogOpen(true);
  };

  const handleEditTier = (tier: LoyaltyTier) => {
    setSelectedTier(tier);
    setTierDialogOpen(true);
  };

  const handleDeleteTier = (tierId: string) => {
    deleteTier(tierId);
  };

  const handleSaveTier = (formData: FormData) => {
    const id = selectedTier?.id || `tier_${Date.now().toString()}`;
    const name = formData.get('name') as string;
    const minimumSpend = parseFloat(formData.get('minimumSpend') as string);
    const discount = parseFloat(formData.get('discount') as string);
    const benefitsString = formData.get('benefits') as string;
    const benefits = benefitsString.split('\n').filter(b => b.trim().length > 0);
    const color = formData.get('color') as string;

    const newTier: LoyaltyTier = {
      id, name, minimumSpend, discount, benefits, color
    };

    if (selectedTier) {
      // Update existing tier
      updateTier(id, newTier);
    } else {
      // Add new tier
      createTier(newTier);
    }

    setTierDialogOpen(false);
  };

  // Handlers for rewards
  const handleAddReward = () => {
    setSelectedReward(null);
    setRewardDialogOpen(true);
  };

  const handleEditReward = (reward: LoyaltyReward) => {
    setSelectedReward(reward);
    setRewardDialogOpen(true);
  };

  const handleDeleteReward = (rewardId: string) => {
    deleteReward(rewardId);
  };

  const handleSaveReward = (formData: FormData) => {
    const id = selectedReward?.id || `reward_${Date.now().toString()}`;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const pointsCost = parseInt(formData.get('pointsCost') as string);
    const isActive = formData.get('isActive') === 'on';

    const newReward: LoyaltyReward = {
      id, name, description, pointsCost, isActive
    };

    if (selectedReward) {
      // Update existing reward
      updateReward(id, newReward);
    } else {
      // Add new reward
      createReward(newReward);
    }

    setRewardDialogOpen(false);
  };

  // Handlers for events
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: LoyaltyEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const handleSaveEvent = (formData: FormData) => {
    const id = selectedEvent?.id || `event_${Date.now().toString()}`;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const pointsAwarded = parseInt(formData.get('pointsAwarded') as string);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const isActive = formData.get('isActive') === 'on';

    const newEvent: LoyaltyEvent = {
      id, name, description, pointsAwarded, startDate, endDate, isActive
    };

    if (selectedEvent) {
      // Update existing event
      updateEvent(id, newEvent);
    } else {
      // Add new event
      createEvent(newEvent);
    }

    setEventDialogOpen(false);
  };

  // Handlers for settings
  const handleSaveSettings = () => {
    const pointsPerDollar = parseFloat((document.getElementById('pointsPerDollar') as HTMLInputElement).value);
    const pointValueInCents = parseFloat((document.getElementById('pointsValue') as HTMLInputElement).value);
    const minimumRedemption = parseInt((document.getElementById('minimumRedemption') as HTMLInputElement).value);
    const expiryPeriodInDays = parseInt((document.getElementById('expiryPeriod') as HTMLInputElement).value);
    const enableBirthdayBonus = (document.getElementById('enableBirthdayBonus') as HTMLInputElement).checked;
    const enableReferralBonus = (document.getElementById('enableReferralBonus') as HTMLInputElement).checked;
    const autoTierUpgrade = (document.getElementById('autoTierUpgrade') as HTMLInputElement).checked;
    const tierDowngradeEnabled = (document.getElementById('tierDowngradeEnabled') as HTMLInputElement).checked;
    const tierDowngradePeriodDays = parseInt((document.getElementById('tierDowngradePeriodDays') as HTMLInputElement).value);
    const spendingCalculationPeriod = (document.getElementById('spendingCalculationPeriod') as HTMLSelectElement).value as 'LIFETIME' | 'ANNUAL' | 'QUARTERLY' | 'MONTHLY';

    const newSettings: LoyaltySettings = {
      pointsPerDollar,
      pointValueInCents,
      minimumRedemption,
      expiryPeriodInDays,
      enableBirthdayBonus,
      birthdayBonusPoints: 50, // Default
      enableReferralBonus,
      referralBonusPoints: 100, // Default
      autoTierUpgrade,
      tierDowngradeEnabled,
      tierDowngradePeriodDays,
      spendingCalculationPeriod
    };

    updateSettings(newSettings);

    toast({
      title: "Settings Saved",
      description: "Your loyalty program settings have been updated."
    });
  };

  // Add handleSettingChange function
  const handleSettingChange = (setting: string, value: any) => {
    // Update the settings state here - this would typically be more complex
    // and update a local state copy before saving to the backend
    setSettingsChanged(true);
  };

  // Show loading state
  if (loading) {
  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`loading-stat-${i}`}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
      </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={`loading-field-${i}`} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={(error) => {
        console.error('Loyalty Program Error:', error);
      }}
    >
      <div className="space-y-6">
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/customers" className="hover:text-foreground transition-colors">
            Customers
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-foreground">Loyalty Program</span>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Loyalty Program</h2>
        </div>

        {/* Dashboard stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="mr-2 h-4 w-4 text-zinc-400" />
                Total Customers in Program
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{customersWithPoints} / {totalCustomers}</div>
              <p className="text-xs text-zinc-400 mt-1">
                {((customersWithPoints / totalCustomers) * 100).toFixed(1)}% program participation
            </p>
          </CardContent>
        </Card>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Star className="mr-2 h-4 w-4 text-zinc-400" />
                Total Points Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{totalPointsIssued.toLocaleString()}</div>
              <p className="text-xs text-zinc-400 mt-1">
                Avg {(totalPointsIssued / (customersWithPoints || 1)).toFixed(0)} points per customer
            </p>
          </CardContent>
        </Card>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Gift className="mr-2 h-4 w-4 text-zinc-400" />
                Available Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{rewards.filter(r => r.isActive).length}</div>
              <p className="text-xs text-zinc-400 mt-1">
                {events.filter(e => e.isActive).length} active promotional events
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-800 p-1 gap-1">
            <TabsTrigger value="tiers" className="data-[state=active]:bg-zinc-700">
              <Award className="h-4 w-4 mr-2" />
              Membership Tiers
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-zinc-700">
              <Gift className="h-4 w-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-zinc-700">
              <Star className="h-4 w-4 mr-2" />
              Special Events
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
        </TabsList>

          {/* Tiers Tab */}
          <TabsContent value="tiers" className="p-0 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Membership Tiers</h3>
              <Button onClick={handleAddTier} variant="black" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers && tiers.length > 0 ? (
                tiers.map((tier) => (
                  <Card key={tier?.id || 'missing-id'} className="bg-zinc-800 border-zinc-700">
                    <div
                      className="h-2 rounded-t-lg"
                      style={{ backgroundColor: tier?.color || '#808080' }}
                    />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{tier?.name || 'Unnamed Tier'}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditTier(tier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteTier(tier?.id || '')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col space-y-1 mb-4">
                        <div className="text-sm text-zinc-400">Minimum Spend:</div>
                        <div>${tier?.minimumSpend?.toLocaleString() || '0.00'}</div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm text-zinc-400">Discount:</div>
                        <div>{tier?.discount || 0}%</div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-700 pt-4">
                      <div className="text-xs text-zinc-400">
                        Benefits ({tier?.benefits?.length || 0}):
                      </div>
                    </CardFooter>
                    <div className="px-6 pb-4">
                      {tier?.benefits && tier.benefits.length > 0 ? (
                        <ul className="text-xs text-zinc-300 list-disc pl-4 space-y-1">
                          {tier.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-zinc-500 italic">No benefits listed</div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-zinc-500">
                  <div className="mb-2">No loyalty tiers defined yet</div>
                  <Button variant="outline" size="sm" onClick={handleAddTier}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add your first tier
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Loyalty Rewards</h2>
                <p className="text-zinc-400">Manage the rewards customers can redeem with points</p>
              </div>
              <Button onClick={handleAddReward}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Reward
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rewards && rewards.length > 0 ? (
                rewards.map((reward) => (
                  <Card key={reward?.id || 'missing-id'} className="bg-zinc-800 border-zinc-700">
                    <CardHeader className="relative pb-2">
                      <div className="absolute right-4 top-4 flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditReward(reward)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteReward(reward?.id || '')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle>{reward?.name || 'Unnamed Reward'}</CardTitle>
                      <CardDescription className="mt-1">
                        {reward?.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mt-2 p-2 rounded bg-muted">
                        <div className="text-sm font-medium">Points Cost:</div>
                        <div className="text-xl font-bold">{reward?.pointsCost?.toLocaleString() || '0'}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-700 pt-4 flex justify-between">
                      <Badge variant={reward?.isActive ? "success" : "outline"}>
                        {reward?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-zinc-500">
                  <div className="mb-2">No rewards defined yet</div>
                  <Button variant="outline" size="sm" onClick={handleAddReward}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add your first reward
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Special Events</h2>
                <p className="text-zinc-400">Configure promotional events that award bonus points</p>
              </div>
              <Button onClick={handleAddEvent}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Upcoming & Active Events</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <TableRow key={event?.id || 'missing-id'}>
                          <TableCell className="font-medium">{event?.name || 'Unnamed Event'}</TableCell>
                          <TableCell>{event?.description || 'No description'}</TableCell>
                          <TableCell>{event?.pointsAwarded?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>{event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'}</div>
                              <div>to</div>
                              <div>{event?.endDate ? new Date(event.endDate).toLocaleDateString() : 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={event?.isActive ? "success" : "destructive"}>
                              {event?.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteEvent(event?.id || '')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                          No events scheduled.
                          <Button variant="link" className="pl-1" onClick={handleAddEvent}>
                            Create your first event
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Program Settings</h2>
                <p className="text-zinc-400">Configure the core loyalty program settings</p>
              </div>
              <Button onClick={handleSaveSettings} disabled={!settingsChanged}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure how the loyalty program works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error loading settings</AlertTitle>
                    <AlertDescription>
                      {error}
                      <Button variant="link" className="p-0 h-auto ml-2" onClick={fetchSettings}>
                        Try again
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="programName">Program Name</Label>
                      <Input
                        id="programName"
                        value={settings?.programName || ''}
                        onChange={(e) => handleSettingChange('programName', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
                      <div className="flex items-center">
                        <Input
                          id="pointsPerDollar"
                          type="number"
                          value={settings?.pointsPerDollar || 1}
                          min={0}
                          step={0.1}
                          onChange={(e) => handleSettingChange('pointsPerDollar', parseFloat(e.target.value))}
                          className="max-w-[120px]"
                        />
                        <span className="ml-2 text-zinc-400">points per $1 spent</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="pointsPerVisit">Points per Visit</Label>
                      <div className="flex items-center">
                        <Input
                          id="pointsPerVisit"
                          type="number"
                          value={settings?.pointsPerVisit || 0}
                          min={0}
                          step={1}
                          onChange={(e) => handleSettingChange('pointsPerVisit', parseInt(e.target.value))}
                          className="max-w-[120px]"
                        />
                        <span className="ml-2 text-zinc-400">points per visit (regardless of spend)</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enabled"
                          checked={settings?.enabled ?? true}
                          onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                        />
                        <Label htmlFor="enabled">Enable Loyalty Program</Label>
                      </div>
                      <p className="text-sm text-zinc-400 ml-7">
                        When disabled, customers will not earn or be able to redeem points
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowPointsRedemption"
                          checked={settings?.allowPointsRedemption ?? true}
                          onCheckedChange={(checked) => handleSettingChange('allowPointsRedemption', checked)}
                        />
                        <Label htmlFor="allowPointsRedemption">Allow Points Redemption</Label>
                      </div>
                      <p className="text-sm text-zinc-400 ml-7">
                        When disabled, customers can still earn points but cannot redeem them
                      </p>
                </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure when and how to notify customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error loading settings</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifyOnPointsEarned"
                          checked={settings?.notifyOnPointsEarned ?? true}
                          onCheckedChange={(checked) => handleSettingChange('notifyOnPointsEarned', checked)}
                        />
                        <Label htmlFor="notifyOnPointsEarned">Points Earned Notification</Label>
                      </div>
                      <p className="text-sm text-zinc-400 ml-7">
                        Send notification when customers earn points
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifyOnTierChange"
                          checked={settings?.notifyOnTierChange ?? true}
                          onCheckedChange={(checked) => handleSettingChange('notifyOnTierChange', checked)}
                        />
                        <Label htmlFor="notifyOnTierChange">Tier Change Notification</Label>
                      </div>
                      <p className="text-sm text-zinc-400 ml-7">
                        Send notification when customers move to a new loyalty tier
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifyOnPointsExpiring"
                          checked={settings?.notifyOnPointsExpiring ?? false}
                          onCheckedChange={(checked) => handleSettingChange('notifyOnPointsExpiring', checked)}
                        />
                        <Label htmlFor="notifyOnPointsExpiring">Points Expiration Warning</Label>
                      </div>
                      <p className="text-sm text-zinc-400 ml-7">
                        Send notification when points are about to expire
                      </p>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

        {/* Tier Dialog */}
        <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedTier ? 'Edit Membership Tier' : 'Create Membership Tier'}
              </DialogTitle>
              <DialogDescription>
                Define the details for this membership tier.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveTier(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tier Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedTier?.name || ''}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumSpend">Minimum Spend ($)</Label>
                <Input
                  id="minimumSpend"
                  name="minimumSpend"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={selectedTier?.minimumSpend.toString() || '0'}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  defaultValue={selectedTier?.discount.toString() || '0'}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits (one per line)</Label>
                <textarea
                  id="benefits"
                  name="benefits"
                  rows={4}
                  className="w-full rounded-md bg-zinc-900 border-zinc-700 p-2"
                  defaultValue={selectedTier?.benefits.join('\n') || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue={selectedTier?.color || '#000000'}
                    className="w-10 h-10 p-1 bg-zinc-900 border-zinc-700"
                  />
                  <Input
                    id="colorHex"
                    value={selectedTier?.color || '#000000'}
                    className="bg-zinc-900 border-zinc-700 flex-1"
                    readOnly
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTierDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedTier ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reward Dialog */}
        <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedReward ? 'Edit Reward' : 'Create Reward'}
              </DialogTitle>
              <DialogDescription>
                Define the details for this loyalty reward.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveReward(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Reward Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedReward?.name || ''}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full rounded-md bg-zinc-900 border-zinc-700 p-2"
                  defaultValue={selectedReward?.description || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsCost">Points Cost</Label>
                <Input
                  id="pointsCost"
                  name="pointsCost"
                  type="number"
                  min="1"
                  defaultValue={selectedReward?.pointsCost.toString() || '100'}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    className="rounded border-zinc-700"
                    defaultChecked={selectedReward?.isActive !== false}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRewardDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedReward ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Event Dialog */}
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? 'Edit Special Event' : 'Create Special Event'}
              </DialogTitle>
              <DialogDescription>
                Define the details for this loyalty event.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveEvent(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedEvent?.name || ''}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full rounded-md bg-zinc-900 border-zinc-700 p-2"
                  defaultValue={selectedEvent?.description || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsAwarded">Points Awarded</Label>
                <Input
                  id="pointsAwarded"
                  name="pointsAwarded"
                  type="number"
                  min="0"
                  defaultValue={selectedEvent?.pointsAwarded.toString() || '50'}
                  className="bg-zinc-900 border-zinc-700"
                  required
                />
                <p className="text-xs text-zinc-400">
                  Enter 0 for special multiplier events
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={selectedEvent?.startDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                    className="bg-zinc-900 border-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={selectedEvent?.endDate.toISOString().split('T')[0] || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]}
                    className="bg-zinc-900 border-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    className="rounded border-zinc-700"
                    defaultChecked={selectedEvent?.isActive !== false}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEventDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedEvent ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
    </ErrorBoundary>
  );
}
