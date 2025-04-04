import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { EmailSettings } from '../types/settings.types';
import { Eye, EyeOff, Save, TestTube } from 'lucide-react';

interface EmailSettingsProps {
  settings: EmailSettings;
  onUpdate: (settings: EmailSettings) => void;
}

// Define schema for email settings
const emailSettingsSchema = z.object({
  server: z.object({
    host: z.string().min(1, "SMTP host is required"),
    port: z.number().int().min(1, "Port must be a positive number"),
    secure: z.boolean(),
    useMock: z.boolean()
  }),
  auth: z.object({
    user: z.string(),
    password: z.string()
  }),
  sender: z.object({
    name: z.string().min(1, "Sender name is required"),
    email: z.string().email("Must be a valid email address")
  }),
  templates: z.object({
    welcomeEmail: z.boolean(),
    passwordReset: z.boolean(),
    orderConfirmation: z.boolean(),
    staffCredentials: z.boolean(),
    invoices: z.boolean()
  })
});

type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>;

export function EmailSettingsPanel({ settings, onUpdate }: EmailSettingsProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [testEmailAddress, setTestEmailAddress] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: settings
  });

  const onSubmit = (data: EmailSettingsFormValues) => {
    onUpdate(data);
    toast({
      title: "Settings Updated",
      description: "Email settings have been saved successfully."
    });
  };

  const handleTestEmail = () => {
    if (!testEmailAddress) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending a test email
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${testEmailAddress}`,
      });
    }, 1500);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Email Settings</h1>
        <p className="text-muted-foreground">Configure email server settings and templates</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="server" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="server">Server Settings</TabsTrigger>
              <TabsTrigger value="sender">Sender Settings</TabsTrigger>
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
            </TabsList>

            {/* Server Settings Tab */}
            <TabsContent value="server" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>SMTP Server Configuration</CardTitle>
                  <CardDescription>Configure your email server settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="server.host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          The hostname of your SMTP server
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="server.port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="587" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Common ports: 25, 465 (SSL), 587 (TLS)
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="server.secure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Use Secure Connection</FormLabel>
                            <FormDescription>
                              Use SSL/TLS for connection
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="server.useMock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Use Mock Mode</FormLabel>
                            <FormDescription>
                              Log emails instead of sending
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>SMTP server authentication credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="auth.user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auth.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="flex">
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                              className="rounded-r-none"
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            className="rounded-l-none"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                        <FormDescription>
                          Your password is stored securely
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sender Settings Tab */}
            <TabsContent value="sender" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sender Information</CardTitle>
                  <CardDescription>Configure the default sender for all emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sender.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Name</FormLabel>
                        <FormControl>
                          <Input placeholder="POS System" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name that will appear in the From field
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sender.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email</FormLabel>
                        <FormControl>
                          <Input placeholder="noreply@posapp.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          The email address that will be used to send emails
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Email</CardTitle>
                  <CardDescription>Send a test email to verify your configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="test@example.com" 
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleTestEmail}
                      disabled={isSending}
                    >
                      {isSending ? "Sending..." : "Send Test Email"}
                      <TestTube className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Templates Tab */}
            <TabsContent value="templates" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Enable or disable specific email templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="templates.welcomeEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Welcome Email</FormLabel>
                          <FormDescription>
                            Sent to new users when their account is created
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templates.passwordReset"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Password Reset</FormLabel>
                          <FormDescription>
                            Sent when a user requests a password reset
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templates.orderConfirmation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Order Confirmation</FormLabel>
                          <FormDescription>
                            Sent to customers when an order is placed
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templates.staffCredentials"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Staff Credentials</FormLabel>
                          <FormDescription>
                            Sent to staff members with their login credentials
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templates.invoices"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Invoices</FormLabel>
                          <FormDescription>
                            Sent to customers with their invoice details
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit">
              Save Changes
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EmailSettingsPanel;
