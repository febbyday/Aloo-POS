import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

/**
 * Settings Controller
 * Handles API requests related to application settings
 */
export class SettingsController {
  /**
   * Get all settings for a specific module
   */
  async getModuleSettings(req: Request, res: Response): Promise<void> {
    try {
      const { module } = req.params;

      if (!module) {
        res.status(400).json({ error: 'Module parameter is required' });
        return;
      }

      // Get all settings for the module from the database
      const settings = await prisma.settings.findMany({
        where: { module },
        orderBy: { key: 'asc' },
      });

      // If no settings found, return default settings
      if (settings.length === 0) {
        const defaultSettings = await this.getDefaultSettingsForModule(module);
        res.json(defaultSettings);
        return;
      }

      // Convert array of settings to a single object
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      res.json(settingsObject);
    } catch (error) {
      console.error(`Error fetching settings for module ${req.params.module}:`, error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  /**
   * Get a specific setting by key for a module
   */
  async getSetting(req: Request, res: Response): Promise<void> {
    try {
      const { module, key } = req.params;

      if (!module || !key) {
        res.status(400).json({ error: 'Module and key parameters are required' });
        return;
      }

      // Get the setting from the database
      const setting = await prisma.settings.findUnique({
        where: {
          module_key: {
            module,
            key,
          },
        },
      });

      // If setting not found, check if it exists in default settings
      if (!setting) {
        const defaultSettings = await this.getDefaultSettingsForModule(module);
        if (defaultSettings && key in defaultSettings) {
          res.json({ [key]: defaultSettings[key] });
          return;
        }

        res.status(404).json({ error: `Setting '${key}' not found for module '${module}'` });
        return;
      }

      res.json({ [key]: setting.value });
    } catch (error) {
      console.error(`Error fetching setting ${req.params.key} for module ${req.params.module}:`, error);
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  }

  /**
   * Update a specific setting for a module
   */
  async updateSetting(req: Request, res: Response): Promise<void> {
    try {
      const { module, key } = req.params;
      const { value } = req.body;
      const userId = (req as any).user?.id; // Get user ID from request (added by auth middleware)

      if (!module || !key) {
        res.status(400).json({ error: 'Module and key parameters are required' });
        return;
      }

      if (value === undefined) {
        res.status(400).json({ error: 'Value is required in request body' });
        return;
      }

      // Check if the setting exists
      const existingSetting = await prisma.settings.findUnique({
        where: {
          module_key: {
            module,
            key,
          },
        },
      });

      let setting;
      let changeType = 'UPDATE';

      if (existingSetting) {
        // Update existing setting
        setting = await prisma.settings.update({
          where: {
            id: existingSetting.id,
          },
          data: {
            value,
            version: { increment: 1 },
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new setting
        changeType = 'CREATE';
        setting = await prisma.settings.create({
          data: {
            module,
            key,
            value,
            version: 1,
          },
        });
      }

      // Create history record
      await prisma.settingsHistory.create({
        data: {
          settingsId: setting.id,
          module,
          key,
          value,
          version: setting.version,
          changeType,
          changedById: userId,
        },
      });

      res.json({ [key]: value });
    } catch (error) {
      console.error(`Error updating setting ${req.params.key} for module ${req.params.module}:`, error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  }

  /**
   * Update all settings for a module
   */
  async updateModuleSettings(req: Request, res: Response): Promise<void> {
    try {
      const { module } = req.params;
      const settings = req.body;
      const userId = (req as any).user?.id; // Get user ID from request (added by auth middleware)

      if (!module) {
        res.status(400).json({ error: 'Module parameter is required' });
        return;
      }

      if (!settings || typeof settings !== 'object') {
        res.status(400).json({ error: 'Settings object is required in request body' });
        return;
      }

      // Get existing settings for the module
      const existingSettings = await prisma.settings.findMany({
        where: { module },
      });

      // Create a map of existing settings by key
      const existingSettingsMap = existingSettings.reduce((acc, setting) => {
        acc[setting.key] = setting;
        return acc;
      }, {} as Record<string, any>);

      // Process each setting in the request
      const updatedSettings: Record<string, any> = {};
      const now = new Date();

      // Use a transaction to ensure all updates are atomic
      await prisma.$transaction(async (tx) => {
        for (const [key, value] of Object.entries(settings)) {
          let setting;
          let changeType = 'UPDATE';

          if (existingSettingsMap[key]) {
            // Update existing setting
            setting = await tx.settings.update({
              where: {
                id: existingSettingsMap[key].id,
              },
              data: {
                value,
                version: { increment: 1 },
                updatedAt: now,
              },
            });
          } else {
            // Create new setting
            changeType = 'CREATE';
            setting = await tx.settings.create({
              data: {
                module,
                key,
                value,
                version: 1,
              },
            });
          }

          // Create history record
          await tx.settingsHistory.create({
            data: {
              settingsId: setting.id,
              module,
              key,
              value,
              version: setting.version,
              changeType,
              changedById: userId,
            },
          });

          updatedSettings[key] = value;
        }
      });

      res.json(updatedSettings);
    } catch (error) {
      console.error(`Error updating settings for module ${req.params.module}:`, error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  /**
   * Get settings history for a module
   */
  async getSettingsHistory(req: Request, res: Response): Promise<void> {
    try {
      const { module } = req.params;

      if (!module) {
        res.status(400).json({ error: 'Module parameter is required' });
        return;
      }

      // Get history records for the module
      const history = await prisma.settingsHistory.findMany({
        where: { module },
        orderBy: { changedAt: 'desc' },
        include: {
          changedBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(history);
    } catch (error) {
      console.error(`Error fetching settings history for module ${req.params.module}:`, error);
      res.status(500).json({ error: 'Failed to fetch settings history' });
    }
  }

  /**
   * Migrate settings from localStorage to database
   * This endpoint receives settings data from the frontend and saves it to the database
   */
  async migrateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { module } = req.params;
      const { settings } = req.body;
      const userId = (req as any).user?.id; // Get user ID from request (added by auth middleware)

      if (!module) {
        res.status(400).json({ error: 'Module parameter is required' });
        return;
      }

      if (!settings || typeof settings !== 'object') {
        res.status(400).json({ error: 'Settings object is required in request body' });
        return;
      }

      console.log(`Migrating settings for module ${module}...`);

      // Get existing settings for the module
      const existingSettings = await prisma.settings.findMany({
        where: { module },
      });

      // Create a map of existing settings by key
      const existingSettingsMap = existingSettings.reduce((acc, setting) => {
        acc[setting.key] = setting;
        return acc;
      }, {} as Record<string, any>);

      // Process each setting in the request
      const migratedSettings: Record<string, any> = {};
      const now = new Date();

      // Use a transaction to ensure all updates are atomic
      await prisma.$transaction(async (tx) => {
        for (const [key, value] of Object.entries(settings)) {
          let setting;
          let changeType = 'UPDATE';

          if (existingSettingsMap[key]) {
            // Update existing setting
            setting = await tx.settings.update({
              where: {
                id: existingSettingsMap[key].id,
              },
              data: {
                value,
                version: { increment: 1 },
                updatedAt: now,
              },
            });
          } else {
            // Create new setting
            changeType = 'CREATE';
            setting = await tx.settings.create({
              data: {
                module,
                key,
                value,
                version: 1,
              },
            });
          }

          // Create history record
          await tx.settingsHistory.create({
            data: {
              settingsId: setting.id,
              module,
              key,
              value,
              version: setting.version,
              changeType: 'MIGRATE', // Special change type for migrations
              changedById: userId,
            },
          });

          migratedSettings[key] = value;
        }
      });

      console.log(`Successfully migrated ${Object.keys(migratedSettings).length} settings for module ${module}`);
      res.json({
        success: true,
        message: `Successfully migrated ${Object.keys(migratedSettings).length} settings for module ${module}`,
        migratedSettings
      });
    } catch (error) {
      console.error(`Error migrating settings for module ${req.params.module}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to migrate settings',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Helper method to get default settings for a module
   */
  private async getDefaultSettingsForModule(module: string): Promise<any> {
    // Return default settings based on the module
    switch (module) {
      case 'system':
        return {
          archiving: {
            enabled: true,
            olderThan: 90,
            archiveFormat: 'zip',
          },
          cache: {
            enabled: true,
            maxSize: 100,
            clearInterval: 24,
          },
          monitoring: {
            enabled: true,
            alertThreshold: 90,
            collectMetrics: true,
          },
          background: {
            maxJobs: 5,
            priority: 'medium',
          },
        };
      case 'appearance':
        return {
          theme: 'light',
          primaryColor: '#0284c7',
          secondaryColor: '#f59e0b',
          fontFamily: 'Inter',
          fontSize: 'medium',
          borderRadius: 'medium',
          animations: true,
        };
      case 'security':
        return {
          password: {
            minLength: 8,
            requireSpecialChar: true,
            requireNumber: true,
            requireUppercase: true,
            expiryDays: 90,
          },
          twoFactor: {
            enabled: false,
            method: 'email',
          },
          session: {
            timeout: 30,
            maxAttempts: 5,
            lockoutDuration: 15,
          },
        };
      case 'payment':
        return {
          methods: {
            cash: {
              enabled: true,
              name: 'Cash',
              icon: 'cash',
              allowChange: true,
            },
            card: {
              enabled: true,
              name: 'Card',
              icon: 'credit-card',
              allowChange: false,
            },
            mobileMoney: {
              enabled: true,
              name: 'Mobile Money',
              icon: 'phone',
              allowChange: false,
            },
          },
          installment: {
            enabled: false,
            minimumAmount: 100,
            minimumDownPaymentPercent: 20,
            plans: [],
          },
        };
      case 'receipt':
        return {
          logo: {
            enabled: true,
            url: '',
            maxHeight: 80,
          },
          customText: {
            header: '',
            footer: 'Thank you for your business!',
            disclaimer: '',
          },
          format: {
            paperSize: '80mm',
            fontSize: 12,
            showBarcode: true,
          },
          digital: {
            enabled: true,
            emailCopy: true,
            smsNotification: false,
          },
        };
      case 'tax':
        return {
          rates: [],
          rules: [],
          currency: {
            code: 'USD',
            symbol: '$',
            position: 'before',
            decimalPlaces: 2,
          },
        };
      case 'hardware':
        return {
          printers: [],
          cashDrawer: {
            enabled: true,
            openTrigger: 'after_sale',
            printer: '',
          },
          scanner: {
            enabled: true,
            type: 'usb',
            prefix: '',
            suffix: '',
          },
          display: {
            customerDisplay: true,
            brightness: 80,
            orientation: 'landscape',
            timeout: 300,
          },
        };
      case 'email':
        return {
          server: {
            host: '',
            port: 587,
            secure: true,
            useMock: true,
          },
          auth: {
            user: '',
            password: '',
          },
          sender: {
            name: 'POS System',
            email: '',
          },
          templates: {
            welcomeEmail: true,
            passwordReset: true,
            orderConfirmation: true,
            staffCredentials: true,
            invoices: true,
          },
        };
      case 'notification':
        return {
          email: {
            enabled: true,
            salesReports: true,
            inventoryAlerts: true,
            systemAlerts: true,
          },
          internal: {
            enabled: true,
            showBadge: true,
            sound: true,
            desktop: true,
            autoRead: false,
            keepDays: 30,
          },
          inventoryAlerts: {
            enabled: true,
            threshold: 5,
          },
          salesMilestones: {
            enabled: true,
            dailyGoal: 1000,
            weeklyGoal: 5000,
            monthlyGoal: 20000,
          },
          securityAlerts: {
            loginAttempts: true,
            systemChanges: true,
            backupStatus: true,
          },
        };
      case 'company':
        return {
          name: 'My Company',
          legalName: '',
          taxId: '',
          logo: '',
          contact: {
            email: '',
            phone: '',
            website: '',
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
      case 'product':
        return {
          inventory: {
            trackInventory: true,
            allowNegativeStock: false,
            lowStockThreshold: 5,
            autoOrderThreshold: 3,
            enableBarcodes: true,
            barcodeFormat: 'CODE128',
            barcodePrefix: '',
          },
          pricing: {
            includeTax: false,
            defaultTaxRate: 0,
            enableSpecialPrices: true,
            enableBulkPrices: true,
            roundingMethod: 'nearest',
            roundingPrecision: 0.01,
          },
          display: {
            showOutOfStock: true,
            defaultSortOrder: 'name',
            productsPerPage: 20,
            showImages: true,
            showSKU: true,
            showCategories: true,
          },
        };
      case 'woocommerce':
        return {
          enabled: false,
          storeUrl: '',
          consumerKey: '',
          consumerSecret: '',
          sync: {
            products: {
              enabled: true,
              frequency: 'hourly',
              importImages: true,
              importCategories: true,
              importAttributes: true,
            },
            inventory: {
              enabled: true,
              syncBidirectional: false,
              threshold: 5,
            },
            orders: {
              import: true,
              defaultStatus: 'processing',
              autoComplete: false,
              notifications: true,
            },
            customers: {
              sync: true,
              importExisting: false,
            },
          },
          prices: {
            allowOverride: false,
            useWooCommercePricing: false,
          },
        };
      case 'gift-cards':
        return {
          enableEmailDelivery: true,
          enablePrintFormat: true,
          enableDigitalWallet: false,
          defaultExpirationPeriod: 90,
          defaultTemplate: '4',
          codePrefix: 'GIFT',
          codeLength: 16,
          allowManualCodes: true,
        };
      default:
        return {};
    }
  }
}

// Export a singleton instance
export const settingsController = new SettingsController();
