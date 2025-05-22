import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Building, Upload, X, Image, RotateCcw, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { SettingsService, companyService } from '../services/company.service';
import { CompanySettings, companySettingsSchema } from '../schemas/company-settings.schema';

export function CompanySettingsPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [formData, setFormData] = useState<CompanySettings | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on component mount with improved error handling
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // First try to load from localStorage to avoid API delays
        const storedSettings = localStorage.getItem('settings_company');
        if (storedSettings) {
          try {
            const parsedSettings = JSON.parse(storedSettings);
            // Apply schema validation to ensure data integrity
            const validatedSettings = companySettingsSchema.parse(parsedSettings);
            setSettings(validatedSettings);
            setFormData(validatedSettings);
            setLogoPreview(validatedSettings.logo || null);

            // Continue loading from API in the background
            setTimeout(() => {
              SettingsService.getSettings()
                .then(apiData => {
                  setSettings(apiData);
                  setFormData(apiData);
                  setLogoPreview(apiData.logo || null);
                })
                .catch(err => {
                  console.warn("Background refresh of company settings failed:", err);
                });
            }, 0);

            // Mark as loaded since we have local data
            setLoading(false);
            return;
          } catch (parseError) {
            console.warn("Error parsing stored company settings, will load from API:", parseError);
            // Continue to API loading if parsing fails
          }
        }

        // If no localStorage data or parsing failed, load from API
        const data = await SettingsService.getSettings();
        setSettings(data);
        setFormData(data);
        setLogoPreview(data.logo || null);
      } catch (error) {
        console.error("Error loading company settings:", error);

        // Use default settings as fallback
        const defaultData = {
          name: 'My Company',
          legalName: '',
          taxId: '',
          logo: '',
          contact: {
            email: '',
            phone: '',
            website: '',
            socialMedia: '',
            supportEmail: '',
          },
          address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
          business: {
            type: 'Retail',
            registrationNumber: '',
            description: '',
            taxId: '',
            foundedYear: null,
            fiscalYear: {
              startMonth: 1,
              startDay: 1,
            },
          },
          branding: {
            primaryColor: '#0284c7',
            secondaryColor: '#f59e0b',
            fontFamily: 'Inter',
          },
        };

        setSettings(defaultData);
        setFormData(defaultData);

        toast({
          title: "Warning",
          description: "Using default company settings due to loading error",
          variant: "warning",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      address: {
        ...prev!.address,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      contact: {
        ...prev!.contact,
        [field]: value
      }
    }));
  };

  const handleBusinessChange = (field: string, value: string | number) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      business: {
        ...prev!.business,
        [field]: value
      }
    }));
  };

  const handleBrandingChange = (field: string, value: string) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      branding: {
        ...prev!.branding,
        [field]: value
      }
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;

    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setFormData(prev => ({
          ...prev!,
          logo: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    if (!formData) return;

    setLogoPreview(null);
    setFormData(prev => ({
      ...prev!,
      logo: ""
    }));
  };

  const saveSettings = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      await SettingsService.saveSettings(formData);
      setSettings(formData);
      toast({
        title: "Settings saved",
        description: "Company settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      const defaultSettings = await SettingsService.resetSettings();
      setSettings(defaultSettings);
      setFormData(defaultSettings);
      setLogoPreview(defaultSettings.logo || null);
      toast({
        title: "Settings reset",
        description: "Company settings have been reset to defaults",
      });
    } catch (error) {
      console.error("Error resetting company settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset company settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Manage your company details, contact information, and legal information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading company settings...</p>
          <div className="w-full max-w-md bg-muted rounded-full h-2.5 overflow-hidden">
            <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '90%' }}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!formData || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Manage your company details, contact information, and legal information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Failed to load settings. Please try again.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company Information</h2>
          <p className="text-muted-foreground">
            Manage your company details, contact information, and legal information.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings} disabled={saving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Address
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Contact
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>
                Upload your company logo for receipts, invoices, and the application header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 flex items-center justify-center border rounded-lg overflow-hidden relative">
                  {logoPreview ? (
                    <>
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Image className="h-12 w-12 mb-2" />
                      <span>No logo uploaded</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 w-full max-w-xs">
                  <Label htmlFor="logo-upload">Upload Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={handleLogoChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, at least 512×512 pixels, PNG or JPEG format.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Basic information about your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input
                    id="legalName"
                    value={formData.legalName}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    value={formData.business.type}
                    onChange={(e) => handleBusinessChange('type', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.business.description || ''}
                    onChange={(e) => handleBusinessChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.business.foundedYear || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : null;
                      handleBusinessChange('foundedYear', value);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Business Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.business.registrationNumber}
                    onChange={(e) => handleBusinessChange('registrationNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input
                    id="taxId"
                    value={formData.business.taxId || ''}
                    onChange={(e) => handleBusinessChange('taxId', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Address</CardTitle>
              <CardDescription>
                Address information for your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How to reach your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.contact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.contact.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.contact.website}
                    onChange={(e) => handleContactChange('website', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialMedia">Social Media</Label>
                  <Input
                    id="socialMedia"
                    value={formData.contact.socialMedia || ''}
                    onChange={(e) => handleContactChange('socialMedia', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    value={formData.contact.supportEmail || ''}
                    onChange={(e) => handleContactChange('supportEmail', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding Information</CardTitle>
              <CardDescription>
                Customize your brand appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={formData.branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                    />
                    <Input
                      type="color"
                      value={formData.branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      className="w-12 p-1 h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      value={formData.branding.secondaryColor}
                      onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                    />
                    <Input
                      type="color"
                      value={formData.branding.secondaryColor}
                      onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                      className="w-12 p-1 h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Company Slogan</Label>
                  <Input
                    id="slogan"
                    value={formData.branding.slogan}
                    onChange={(e) => handleBrandingChange('slogan', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
