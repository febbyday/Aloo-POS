// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { apiClient, ApiResponse as APIResponse } from '@/lib/api/api-client';
import { eventBus } from '@/lib/eventBus';
import { AUTH_EVENTS } from '@/features/auth/types/auth.types';
import { Shop, ShopStatus, ShopType } from '@/features/shops/types/shops.types';

// Constants
const MOCK_DELAY = 500; // ms
const MOCK_SHOPS_COUNT = 15;
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const API_PREFIX = '/shops'; // Standardized prefix

/**
 * Interface for Shop Service operations.
 */
export interface IShopService {
  fetchAll(params?: Record<string, any>): Promise<Shop[]>;
  fetchById(id: string): Promise<Shop | null>;
  create(shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop | null>;
  update(id: string, shopData: Partial<Shop>): Promise<Shop | null>;
  delete(id: string): Promise<boolean>;
  checkCodeExists(code: string): Promise<boolean>;
  // Add other methods as needed (assignStaff, getActivity, etc.)
}

/**
 * Real implementation of IShopService using API client.
 */
class RealShopService implements IShopService {
  private isAuthenticated = false;

  constructor() {
    this.setupAuthListeners();
    // Initial check based on token presence (can be refined)
     this.isAuthenticated = !!localStorage.getItem('authToken');
     console.log('[RealShopService] Initial auth status:', this.isAuthenticated);
  }

  private setupAuthListeners() {
    // Listen for authentication events using subscribe method
    eventBus.subscribe(AUTH_EVENTS.LOGIN_SUCCESS, this.handleAuthChange);
    eventBus.subscribe(AUTH_EVENTS.LOGOUT, this.handleAuthChange);
    eventBus.subscribe(AUTH_EVENTS.TOKEN_REFRESHED, this.handleAuthChange);
    // eventBus.on(AUTH_EVENTS.AUTH_CHECK_COMPLETE, this.handleAuthChange); // Commented out - Event likely doesn't exist
  }

  private handleAuthChange = (detail: any) => {
    // Determine auth state based on event type or detail content
    this.isAuthenticated = detail?.isAuthenticated ??
                           [AUTH_EVENTS.LOGIN_SUCCESS, AUTH_EVENTS.TOKEN_REFRESHED].includes(detail?.type);
    console.log(`[RealShopService] Auth status changed via event ${detail?.type}:`, this.isAuthenticated);
  };

  /**
   * Check if the user is authenticated
   * @returns True if authenticated, false otherwise
   */
  private checkAuth(): boolean {
    // In development mode, always return true to bypass authentication checks
    if (import.meta.env.DEV) {
      console.log('[RealShopService] Development mode: Authentication bypass enabled');
      return true;
    }
    return this.isAuthenticated;
  }

  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<APIResponse<T>> {
    // In development mode, bypass authentication check
    if (import.meta.env.DEV) {
      // Development mode - proceed with request regardless of authentication
      console.log('[RealShopService] Development mode: Bypassing authentication check for API request');
    } else if (!this.checkAuth()) {
      // Production mode - require authentication
      throw new Error('Authentication required.');
    }

    try {
      console.log(`Making ${method.toUpperCase()} request to ${endpoint}`, { params, data });
      let response;
      switch (method) {
        case 'get':
          response = await apiClient.get<T>(endpoint, params);
          break;
        case 'post':
          response = await apiClient.post<T>(endpoint, data);
          break;
        case 'put':
          response = await apiClient.put<T>(endpoint, data);
          break;
        case 'delete':
          response = await apiClient.delete<T>(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      console.log(`Received response from ${endpoint}`, response.data);

      return response.data as APIResponse<T>;
    } catch (error: any) {
      console.error(`API request failed for ${method.toUpperCase()} ${endpoint}`, error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error detected. Emitting logout event.');
        eventBus.emit(AUTH_EVENTS.LOGOUT, {});
        // Update local state immediately
        this.isAuthenticated = false;
      }
      // Re-throw the error to be handled by the calling method
      throw error;
    }
  }

  async fetchAll(params: Record<string, any> = {}): Promise<Shop[]> {
    console.log('[RealShopService] Fetching all shops. Auth status:', this.isAuthenticated);

    // In development mode, bypass authentication check
    if (import.meta.env.DEV) {
      console.log('[RealShopService] Development mode: Authentication bypass enabled for fetchAll');
    } else if (!this.isAuthenticated) {
      // Only check authentication in production mode
      console.warn('[RealShopService] User not authenticated. Cannot fetch shops.');
      return [];
    }

    try {
      // Use apiClient for consistency
      const response = await this.makeRequest<Shop[]>('get', API_PREFIX, undefined, params);
      console.log('[RealShopService] Raw API Response:', response);
      const data = response.data;
      let shopData: Shop[] = [];

      // --- Refined Response Format Handling ---
      // Format 1: Direct Array response: [...]
       if (Array.isArray(data)) {
        console.log('Using Format 1 (Direct Array)');
        shopData = data as Shop[];
      }
      // Format 2: Paginated response: { data: [...], meta: {...} } or { data: { data: [...], meta: {...} } }
      else if (typeof data === 'object' && data !== null && 'meta' in data && 'data' in data) {
         const responseData = data as { data: any, meta: any };
         const potentialDataArray = Array.isArray(responseData.data)
            ? responseData.data
            : (typeof responseData.data === 'object' && responseData.data !== null &&
               'data' in responseData.data && Array.isArray(responseData.data.data)
               ? responseData.data.data
               : null);
         if (potentialDataArray) {
             console.log('Using Format 2 (Paginated)');
             shopData = potentialDataArray as Shop[];
         }
      }
      // Format 3: Simple object wrapper: { shops: [...] } or { items: [...] }
      else if (typeof data === 'object' && data !== null) {
         const responseData = data as Record<string, any>;
         if ('shops' in responseData && Array.isArray(responseData.shops)) {
             console.log('Using Format 3 ({shops: []})');
             shopData = responseData.shops as Shop[];
         } else if ('items' in responseData && Array.isArray(responseData.items)) {
             console.log('Using Format 3 ({items: []})');
             shopData = responseData.items as Shop[];
         }
      }
       // Format 4: Standard API Response: { success: true, data: [...] }
       else if (typeof data === 'object' && data !== null) {
           const responseData = data as { success?: boolean, data?: any };
           if (responseData.success === true && 'data' in responseData && Array.isArray(responseData.data)) {
               console.log('Using Format 4 ({success: true, data: []})');
               shopData = responseData.data as Shop[];
           }
       }
      // Format 5: Standard API Response with nested object: { success: true, data: { shops: [...] } } or { success: true, data: { items: [...] } } etc.
      else if (typeof data === 'object' && data !== null) {
         const responseData = data as { success?: boolean, data?: any };
         if (responseData.success === true && 'data' in responseData &&
             typeof responseData.data === 'object' && responseData.data !== null) {
             console.log('Using Format 5 ({success: true, data: { ... }})');
             const dataContainer = responseData.data as Record<string, any>;
             if (Array.isArray(dataContainer)) { // Case: { success: true, data: [...] } - handled by Format 4 but check again
                 shopData = dataContainer as Shop[];
             } else {
                 // Look for common array property names
                 const commonKeys = ['shops', 'items', 'data', 'list', 'results'];
                 let found = false;
                 for (const key of commonKeys) {
                     if (key in dataContainer && Array.isArray(dataContainer[key])) {
                         console.log(`Found shop data in nested property: data.${key}`);
                         shopData = dataContainer[key] as Shop[];
                         found = true;
                         break;
                     }
                 }
                 // If no common key found, check if the data object itself is a single shop
                 if (!found && dataContainer.hasOwnProperty('id') && dataContainer.hasOwnProperty('name')) {
                     console.log('Found single shop object in data property');
                     shopData = [dataContainer as Shop];
                 }
             }
         }
      }
      // --- End Response Format Handling ---

      // Direct array with no data is valid - there are just no shops yet
      if (Array.isArray(data) && data.length === 0) {
        console.log('[RealShopService] API returned empty array - no shops exist yet');
        return [];
      }

      if (shopData !== null) {
        console.log(`[RealShopService] Successfully processed ${shopData.length} shops.`);
        return shopData;
      } else {
        console.warn('[RealShopService] Response format not recognized:', response);
        if (USE_MOCK_DATA && import.meta.env.DEV) {
          console.warn('[RealShopService] Falling back to mock data due to unknown response format.');
          return mockShopServiceInstance.fetchAll(params); // Use mock service instance
        }
        return []; // Return empty array if format is unknown and not using mock
      }
    } catch (error: any) {
      console.error('[RealShopService] Error fetching shops:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('[RealShopService] Authentication error fetching shops. Emitting logout.');
        eventBus.emit(AUTH_EVENTS.LOGOUT, {}); // Added payload argument
      }
      if (USE_MOCK_DATA && import.meta.env.DEV) {
        console.warn('[RealShopService] API fetch failed, falling back to mock data.');
        return mockShopServiceInstance.fetchAll(params); // Use mock service instance
      }
      return [];
    }
  }

   async fetchById(id: string): Promise<Shop | null> {
     console.log(`[RealShopService] Fetching shop by ID: ${id}. Auth status:`, this.isAuthenticated);

     // In development mode, bypass authentication check
     if (import.meta.env.DEV) {
       console.log('[RealShopService] Development mode: Authentication bypass enabled for fetchById');
     } else if (!this.isAuthenticated) {
       // Only check authentication in production mode
       console.warn('[RealShopService] User not authenticated. Cannot fetch shop by ID.');
       return null;
     }
     try {
       const response = await this.makeRequest<Shop>('get', `${API_PREFIX}/${id}`);
       const data = response.data;
       console.log(`[RealShopService] Raw API Response for ID ${id}:`, response);

        // Handle potential response formats { success: true, data: {...} } or just {...}
       let shopData: Shop | null = null;
        if (typeof data === 'object' && data !== null) {
            const responseData = data as Record<string, any>;
            if ('success' in responseData && responseData.success === true &&
                'data' in responseData && typeof responseData.data === 'object' &&
                responseData.data !== null && 'id' in responseData.data) {
                 shopData = responseData.data as Shop; // Format { success: true, data: {Shop} }
            } else if ('id' in responseData) {
                 shopData = responseData as Shop; // Format {Shop}
            }
        }

       if (shopData) {
         console.log(`[RealShopService] Successfully processed shop ID ${id}.`);
         return shopData;
       } else {
          console.error(`[RealShopService] Unexpected response format for shop ID ${id}:`, response.data);
           if (USE_MOCK_DATA && import.meta.env.DEV) {
               console.warn(`[RealShopService] API fetch failed for shop ${id}, falling back to mock data.`);
               return mockShopServiceInstance.fetchById(id); // Use mock service instance
           }
          return null;
       }
     } catch (error: any) {
       console.error(`[RealShopService] Error fetching shop ${id}:`, error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            eventBus.emit(AUTH_EVENTS.LOGOUT, {}); // Added payload argument
        }
        if (USE_MOCK_DATA && import.meta.env.DEV) {
         console.warn(`[RealShopService] API fetch failed for shop ${id}, falling back to mock data.`);
         return mockShopServiceInstance.fetchById(id); // Use mock service instance
       }
       return null;
     }
   }

   async create(shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop | null> {
     console.log('[RealShopService] Creating shop. Auth status:', this.isAuthenticated);

     // In development mode, bypass authentication check
     if (import.meta.env.DEV) {
       console.log('[RealShopService] Development mode: Authentication bypass enabled for create');
     } else if (!this.isAuthenticated) {
       // Only check authentication in production mode
       console.warn('[RealShopService] User not authenticated. Cannot create shop.');
       return null;
     }
     try {
       const response = await this.makeRequest<Shop>('post', API_PREFIX, shopData);
        console.log('[RealShopService] Raw API Response for create:', response);
       const data = response.data;
        let createdShop: Shop | null = null;

        if (typeof data === 'object' && data !== null) {
            const responseData = data as Record<string, any>;
            if ('success' in responseData && responseData.success === true &&
                'data' in responseData && typeof responseData.data === 'object' &&
                responseData.data !== null && 'id' in responseData.data) {
                 createdShop = responseData.data as Shop;
            } else if ('id' in responseData) {
                 createdShop = responseData as Shop;
            }
        }

       if (createdShop) {
           console.log('[RealShopService] Successfully created shop:', createdShop);
           return createdShop;
       } else {
           console.error('[RealShopService] Unexpected response format after creating shop:', response.data);
           return null;
       }
     } catch (error: any) {
       console.error('[RealShopService] Error creating shop:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            eventBus.emit(AUTH_EVENTS.LOGOUT, {}); // Added payload argument
        }
       // No mock fallback for create
       return null;
     }
   }

   async update(id: string, shopData: Partial<Shop>): Promise<Shop | null> {
     console.log(`[RealShopService] Updating shop ${id}. Auth status:`, this.isAuthenticated);

     // In development mode, bypass authentication check
     if (import.meta.env.DEV) {
       console.log('[RealShopService] Development mode: Authentication bypass enabled for update');
     } else if (!this.isAuthenticated) {
       // Only check authentication in production mode
       console.warn('[RealShopService] User not authenticated. Cannot update shop.');
       return null;
     }
     try {
       const response = await this.makeRequest<Shop>('put', `${API_PREFIX}/${id}`, shopData);
        console.log(`[RealShopService] Raw API Response for update ${id}:`, response);
       const data = response.data;
        let updatedShop: Shop | null = null;

        if (typeof data === 'object' && data !== null) {
            const responseData = data as Record<string, any>;
            if ('success' in responseData && responseData.success === true &&
                'data' in responseData && typeof responseData.data === 'object' &&
                responseData.data !== null && 'id' in responseData.data) {
                 updatedShop = responseData.data as Shop;
            } else if ('id' in responseData) {
                 updatedShop = responseData as Shop;
            }
        }

       if (updatedShop) {
           console.log('[RealShopService] Successfully updated shop:', updatedShop);
            return updatedShop;
       } else {
           console.error(`[RealShopService] Unexpected response format after updating shop ${id}:`, response.data);
            if (USE_MOCK_DATA && import.meta.env.DEV) {
                console.warn(`[RealShopService] API update failed for shop ${id}, falling back to mock data update (local only).`);
                return mockShopServiceInstance.update(id, shopData); // Use mock service instance
            }
           return null;
       }
     } catch (error: any) {
       console.error(`[RealShopService] Error updating shop ${id}:`, error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            eventBus.emit(AUTH_EVENTS.LOGOUT, {}); // Added payload argument
        }
       if (USE_MOCK_DATA && import.meta.env.DEV) {
         console.warn(`[RealShopService] API update failed for shop ${id}, falling back to mock data update (local only).`);
         return mockShopServiceInstance.update(id, shopData); // Use mock service instance
       }
       return null;
     }
   }

   async delete(id: string): Promise<boolean> {
     console.log(`[RealShopService] Deleting shop ${id}. Auth status:`, this.isAuthenticated);

     // In development mode, bypass authentication check
     if (import.meta.env.DEV) {
       console.log('[RealShopService] Development mode: Authentication bypass enabled for delete');
     } else if (!this.isAuthenticated) {
       // Only check authentication in production mode
       console.warn('[RealShopService] User not authenticated. Cannot delete shop.');
       return false;
     }
     try {
       await this.makeRequest<{success: boolean}>('delete', `${API_PREFIX}/${id}`);
       console.log(`[RealShopService] Successfully deleted shop ${id}.`);
       return true;
     } catch (error: any) {
       console.error(`[RealShopService] Error deleting shop ${id}:`, error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            eventBus.emit(AUTH_EVENTS.LOGOUT, {}); // Added payload argument
        }
       if (USE_MOCK_DATA && import.meta.env.DEV) {
         console.warn(`[RealShopService] API delete failed for shop ${id}, falling back to mock data delete (local only).`);
         return mockShopServiceInstance.delete(id); // Use mock service instance
       }
       return false;
     }
   }

   /**
    * Check if a shop code already exists
    * @param code Shop code to check
    * @returns True if the code exists, false otherwise
    */
   async checkCodeExists(code: string): Promise<boolean> {
     console.log(`[RealShopService] Checking if shop code exists: ${code}`);
     if (!code) {
       return false;
     }

     try {
       const response = await this.makeRequest<APIResponse<{exists: boolean}>>('get', `${API_PREFIX}/check-code`, undefined, { code });
       console.log(`[RealShopService] Shop code check response:`, response);

       // Handle different response formats
       if (response.data && typeof response.data === 'object') {
         const responseData = response.data as Record<string, any>;
         if ('exists' in responseData) {
           return Boolean(responseData.exists);
         }
       }

       // Fallback: If we can't determine from the response, assume it doesn't exist
       return false;
     } catch (error: any) {
       console.error(`[RealShopService] Error checking shop code ${code}:`, error);

       // In development mode with mock data, check against mock shops
       if (USE_MOCK_DATA && import.meta.env.DEV) {
         console.warn(`[RealShopService] API check failed for code ${code}, falling back to mock check.`);
         return mockShopServiceInstance.checkCodeExists(code);
       }

       // If there's an error, assume the code doesn't exist
       return false;
     }
   }
  // Implement other IShopService methods (assignStaff, etc.) using apiClient
  // ...
}


/**
 * Mock implementation of IShopService for development/testing.
 */
class MockShopService implements IShopService {
  private mockShops: Shop[] = [];

  constructor() {
    if (this.mockShops.length === 0) {
      this.generateMockData();
    }
  }

  private generateMockData() {
    console.log('[MockShopService] Generating mock shop data...');
    this.mockShops = Array.from({ length: MOCK_SHOPS_COUNT }, (_, i) => {
      const shop: Shop = {
        id: `mock-${i + 1}`,
        code: `SHP-${String(i + 1).padStart(3, '0')}`,
        name: `Mock Shop ${i + 1}`,
        type: i % 3 === 0 ? ShopType.RETAIL : (i % 3 === 1 ? ShopType.WAREHOUSE : ShopType.RETAIL),
        status: i % 4 === 0 ? ShopStatus.INACTIVE : ShopStatus.ACTIVE,
        address: {
          street: `${i + 1} Mock St`,
          city: 'Mockville',
          state: 'Mockstate',
          postalCode: '10000',
          country: 'Mockland',
          latitude: 0,
          longitude: 0
        },
        phone: `555-${String(1000 + i).substring(1)}`,
        email: `shop${i + 1}@mockretail.test`,
        manager: `manager-${i + 1}`,
        operatingHours: {
          monday: { open: true, openTime: '09:00', closeTime: '18:00' },
          tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
          wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
          thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
          friday: { open: true, openTime: '09:00', closeTime: '19:00' },
          saturday: { open: true, openTime: '10:00', closeTime: '17:00' },
          sunday: { open: false }
        },
        timezone: 'America/New_York',
        settings: {
          allowNegativeInventory: i % 2 === 0,
          defaultTaxRate: 0.07,
          requireStockCheck: true,
          autoPrintReceipt: i % 2 === 0,
          defaultDiscountRate: 0.05,
          enableCashierTracking: true,
          allowReturnWithoutReceipt: i % 3 === 0,
          minPasswordLength: 8,
          requireManagerApproval: {
            forDiscount: true,
            forVoid: true,
            forReturn: true,
            forRefund: true,
            forPriceChange: true
          },
          thresholds: {
            lowStock: 5,
            criticalStock: 2,
            reorderPoint: 10
          },
          maxItemsPerTransaction: 100
        },
        isHeadOffice: i === 0,
        taxId: `TAX-${i+1}`,
        licenseNumber: `LIC-${i+1}-MOCK`,
        website: i % 2 === 0 ? `https://shop${i+1}.mockretail.test` : undefined,
        logoUrl: i % 3 === 0 ? `/assets/logos/shop-${i+1}.png` : undefined,
        staffAssignments: [],
        inventoryLocations: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (365 - i * 7)).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (30 - i)).toISOString()
      };
      return shop;
    });
    console.log(`[MockShopService] Generated ${this.mockShops.length} mock shops.`);
  }

  async fetchAll(params: Record<string, any> = {}): Promise<Shop[]> {
    console.log('[MockShopService] Fetching all mock shops with params:', params);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    let filteredShops = this.mockShops;
    if (params.status) {
      filteredShops = filteredShops.filter(shop => shop.status === params.status);
    }
    if (params.type) {
      filteredShops = filteredShops.filter(shop => shop.type === params.type);
    }
    console.log(`[MockShopService] Returning ${filteredShops.length} mock shops.`);
    return filteredShops;
  }

  async fetchById(id: string): Promise<Shop | null> {
    console.log(`[MockShopService] Fetching mock shop by ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const shop = this.mockShops.find(s => s.id === id) || null;
    console.log('[MockShopService] Found mock shop:', shop);
    return shop;
  }

  async create(shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop | null> {
    console.log('[MockShopService] Creating mock shop:', shopData);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    // Create a new shop with proper type structure
    const newShop: Shop = {
      // Required fields with defaults if not provided
      id: `mock-${this.mockShops.length + 1}`,
      code: shopData.code || `SHP-${String(this.mockShops.length + 1).padStart(3, '0')}`,
      name: shopData.name || `New Mock Shop ${this.mockShops.length + 1}`,
      type: shopData.type || ShopType.RETAIL,
      status: shopData.status || ShopStatus.PENDING,
      address: shopData.address || {
        street: '?',
        city: '?',
        state: '?',
        postalCode: '?',
        country: '?',
        latitude: 0,
        longitude: 0
      },
      phone: shopData.phone || '555-0000',

      // Optional fields with defaults
      email: shopData.email || `new${this.mockShops.length+1}@mock.com`,
      manager: shopData.manager || 'unassigned',
      operatingHours: shopData.operatingHours || {
        monday: { open: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
        friday: { open: true, openTime: '09:00', closeTime: '19:00' },
        saturday: { open: true, openTime: '10:00', closeTime: '17:00' },
        sunday: { open: false }
      },
      timezone: shopData.timezone || 'America/New_York',
      settings: shopData.settings || {
        allowNegativeInventory: false,
        defaultTaxRate: 0.07,
        requireStockCheck: true,
        autoPrintReceipt: true,
        defaultDiscountRate: 0.05,
        enableCashierTracking: true,
        allowReturnWithoutReceipt: false,
        minPasswordLength: 8,
        requireManagerApproval: {
          forDiscount: true,
          forVoid: true,
          forReturn: true,
          forRefund: true,
          forPriceChange: true
        },
        thresholds: {
          lowStock: 5,
          criticalStock: 2,
          reorderPoint: 10
        },
        maxItemsPerTransaction: 100
      },
      isHeadOffice: shopData.isHeadOffice || false,
      taxId: shopData.taxId || `TAX-NEW-${this.mockShops.length+1}`,
      licenseNumber: shopData.licenseNumber || `LIC-NEW-${this.mockShops.length+1}`,
      website: shopData.website,
      logoUrl: shopData.logoUrl,

      // Required for Shop type
      staffAssignments: [],
      inventoryLocations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockShops.push(newShop);
    console.log('[MockShopService] Created new mock shop:', newShop);
    return newShop;
  }

  async update(id: string, shopData: Partial<Shop>): Promise<Shop | null> {
    console.log(`[MockShopService] Updating mock shop ${id}:`, shopData);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const index = this.mockShops.findIndex(s => s.id === id);
    if (index === -1) {
      console.log(`[MockShopService] Shop ${id} not found for update.`);
      return null;
    }

    // Get the existing shop
    const existingShop = this.mockShops[index];
    if (!existingShop) {
      console.log(`[MockShopService] Shop ${id} not found at index ${index}.`);
      return null;
    }

    // Create a new shop object with the updated data
    const updatedShop: Shop = {
      ...existingShop,
      // Update with new data if provided
      ...(shopData as Partial<Shop>),
      // Always update the updatedAt timestamp
      updatedAt: new Date().toISOString()
    };

    // Update the shop in the array
    this.mockShops[index] = updatedShop;
    console.log('[MockShopService] Updated shop:', updatedShop);
    return updatedShop;
  }

  async delete(id: string): Promise<boolean> {
    console.log(`[MockShopService] Deleting mock shop ${id}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const initialLength = this.mockShops.length;
    this.mockShops = this.mockShops.filter(s => s.id !== id);
    const success = this.mockShops.length < initialLength;
    console.log(`[MockShopService] Deletion ${success ? 'successful' : 'failed (not found)'}.`);
    return success;
  }

  /**
   * Check if a shop code already exists in mock data
   * @param code Shop code to check
   * @returns True if the code exists, false otherwise
   */
  async checkCodeExists(code: string): Promise<boolean> {
    console.log(`[MockShopService] Checking if mock shop code exists: ${code}`);
    if (!code) {
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY / 2)); // Shorter delay for code check

    const exists = this.mockShops.some(shop =>
      shop.code.toLowerCase() === code.toLowerCase()
    );

    console.log(`[MockShopService] Shop code ${code} exists: ${exists}`);
    return exists;
  }

   // Implement mock versions of other IShopService methods if needed
   // ...
}

// Create instances of the services
const realShopServiceInstance = new RealShopService();
const mockShopServiceInstance = new MockShopService();

// Export the instances for direct access
export { realShopServiceInstance as realShopService };
export { mockShopServiceInstance as mockShopService };

// Export the appropriate service based on the environment variable
export const shopService: IShopService = USE_MOCK_DATA ? mockShopServiceInstance : realShopServiceInstance;

console.log(`[ShopService] Service initialized. Using ${USE_MOCK_DATA ? 'Mock' : 'Real'} implementation.`);
