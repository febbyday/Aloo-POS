import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFinance } from "../context/FinanceContext";
import { 
  Settings, 
  DollarSign, 
  CreditCard, 
  Building2, 
  Calculator,
  Bell,
  Mail,
  Lock,
  FileText,
  Users,
  Wallet,
  RefreshCw,
  Database,
  Globe
} from "lucide-react";

export const FinanceSettingsPage: React.FC = () => {
  const { settings } = useFinance();

  return (
    <>
      <Helmet>
        <title>Finance Settings | Finance | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Finance Settings</h1>
          <p className="text-muted-foreground">
            Configure financial settings and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Currency Settings</CardTitle>
                  <CardDescription>
                    Configure your base currency and display preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Base Currency</Label>
                    <Select defaultValue={settings.currency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                        <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="format">Number Format</Label>
                    <Select defaultValue="en-US">
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">1,234.56</SelectItem>
                        <SelectItem value="de-DE">1.234,56</SelectItem>
                        <SelectItem value="fr-FR">1 234,56</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Currency Symbol</Label>
                      <p className="text-sm text-muted-foreground">
                        Display currency symbol before amounts
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fiscal Year</CardTitle>
                  <CardDescription>
                    Define your fiscal year settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fiscalStart">Fiscal Year Start</Label>
                    <Select defaultValue="1">
                      <SelectTrigger id="fiscalStart">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taxYear">Tax Year</Label>
                    <Select defaultValue="calendar">
                      <SelectTrigger id="taxYear">
                        <SelectValue placeholder="Select tax year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calendar">Calendar Year</SelectItem>
                        <SelectItem value="fiscal">Fiscal Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lock Previous Periods</Label>
                      <p className="text-sm text-muted-foreground">
                        Prevent changes to closed periods
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Configure accepted payment methods and processing settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Cash Settings */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Cash</h3>
                          <p className="text-sm text-muted-foreground">Physical cash payments</p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="cashRounding">Rounding Rule</Label>
                        <Select defaultValue="none">
                          <SelectTrigger id="cashRounding">
                            <SelectValue placeholder="Select rounding" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Rounding</SelectItem>
                            <SelectItem value="nearest5">Nearest 0.05</SelectItem>
                            <SelectItem value="nearest10">Nearest 0.10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Card Settings */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Credit/Debit Cards</h3>
                          <p className="text-sm text-muted-foreground">Card payment processing</p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="cardProcessor">Payment Processor</Label>
                        <Select defaultValue="stripe">
                          <SelectTrigger id="cardProcessor">
                            <SelectValue placeholder="Select processor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Signature</Label>
                          <p className="text-sm text-muted-foreground">For transactions over $25</p>
                        </div>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer Settings */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Bank Transfers</h3>
                          <p className="text-sm text-muted-foreground">Direct bank transfer payments</p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="bankDetails">Bank Account</Label>
                        <Input id="bankDetails" placeholder="Enter bank account details" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Save Payment Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Accounting Tab */}
          <TabsContent value="accounting">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Chart of Accounts</CardTitle>
                  <CardDescription>
                    Configure your account structure and numbering
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="accountFormat">Account Number Format</Label>
                    <Select defaultValue="4-2">
                      <SelectTrigger id="accountFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4-2">4-2 (1000-00)</SelectItem>
                        <SelectItem value="3-3">3-3 (100-000)</SelectItem>
                        <SelectItem value="5">5 (10000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultAccounts">Default Accounts</Label>
                    <div className="space-y-2">
                      <Select defaultValue="1000">
                        <SelectTrigger>
                          <SelectValue placeholder="Cash Account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1000 - Cash</SelectItem>
                          <SelectItem value="1010">1010 - Bank</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="4000">
                        <SelectTrigger>
                          <SelectValue placeholder="Revenue Account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4000">4000 - Sales Revenue</SelectItem>
                          <SelectItem value="4100">4100 - Service Revenue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Settings</CardTitle>
                  <CardDescription>
                    Configure transaction processing rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        For transactions over $1,000
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Reconciliation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically match bank transactions
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div>
                    <Label htmlFor="reconcileFreq">Reconciliation Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="reconcileFreq">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure alerts and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">Configure email alerts</p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Daily Reports</Label>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Large Transactions</Label>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Reconciliation Alerts</Label>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>

                  {/* System Notifications */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">System Notifications</h3>
                          <p className="text-sm text-muted-foreground">In-app notification settings</p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Low Balance Alerts</Label>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Payment Due Reminders</Label>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>System Updates</Label>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>

                  {/* Recipients */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium">Notification Recipients</h3>
                        <p className="text-sm text-muted-foreground">Who receives notifications</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Enter email addresses"
                        defaultValue="finance@example.com, accounting@example.com"
                      />
                      <p className="text-sm text-muted-foreground">
                        Separate multiple email addresses with commas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Security</CardTitle>
                  <CardDescription>
                    Configure transaction security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        For high-value transactions
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div>
                    <Label htmlFor="threshold">Transaction Threshold</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="threshold"
                        type="number"
                        placeholder="1000.00"
                        className="pl-8"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Require approval above this amount
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="approvers">Required Approvers</Label>
                    <Select defaultValue="1">
                      <SelectTrigger id="approvers">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">One Approver</SelectItem>
                        <SelectItem value="2">Two Approvers</SelectItem>
                        <SelectItem value="3">Three Approvers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                  <CardDescription>
                    Manage access to financial data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP Restrictions</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit access to specific IPs
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="sessionTimeout">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Track all financial activities
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="grid gap-4">
              {/* Accounting Software */}
              <Card>
                <CardHeader>
                  <CardTitle>Accounting Software Integration</CardTitle>
                  <CardDescription>
                    Connect with your accounting software
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Calculator className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium">QuickBooks Integration</h3>
                        <p className="text-sm text-muted-foreground">
                          Connected - Last sync: Today at 09:15 AM
                        </p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Database className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium">Xero Integration</h3>
                        <p className="text-sm text-muted-foreground">
                          Not connected
                        </p>
                      </div>
                      <Button>Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Gateways */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Gateway Integrations</CardTitle>
                  <CardDescription>
                    Configure payment processing integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Wallet className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium">Stripe</h3>
                        <p className="text-sm text-muted-foreground">
                          Connected - Processing enabled
                        </p>
                      </div>
                      <Button variant="outline">Settings</Button>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Globe className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium">PayPal</h3>
                        <p className="text-sm text-muted-foreground">
                          Not configured
                        </p>
                      </div>
                      <Button>Set Up</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Integration */}
              <Card>
                <CardHeader>
                  <CardTitle>Banking Integration</CardTitle>
                  <CardDescription>
                    Connect your bank accounts for automatic reconciliation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium">Bank Feed</h3>
                        <p className="text-sm text-muted-foreground">
                          2 accounts connected
                        </p>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <RefreshCw className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium">Auto-Reconciliation</h3>
                        <p className="text-sm text-muted-foreground">
                          Enabled - Running daily
                        </p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}; 