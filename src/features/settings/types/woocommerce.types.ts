export interface WooCommerceSettings {
    enabled: boolean;
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
    sync: {
        products: {
            enabled: boolean;
            frequency: 'realtime' | 'hourly' | 'daily' | 'manual';
            importImages: boolean;
            importCategories: boolean;
            importAttributes: boolean;
        };
        inventory: {
            enabled: boolean;
            syncBidirectional: boolean;
            threshold: number;
        };
        orders: {
            import: boolean;
            defaultStatus: string;
            autoComplete: boolean;
            notifications: boolean;
        };
        customers: {
            sync: boolean;
            importExisting: boolean;
        };
    };
    prices: {
        allowOverride: boolean;
        useWooCommercePricing: boolean;
    };
}

export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';

export interface ConnectionTestResult {
    success: boolean;
    message: string;
    timestamp: string;
}
