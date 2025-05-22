/**
 * Test file to check connection to the shops API
 * Uses the enhanced API client for consistent error handling and retry capability
 */
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';

/**
 * Test function to fetch shops data
 */
export async function testShopsApiConnection() {
  console.log('Testing connection to shops API...');
  const apiUrl = getApiUrl('shops', 'LIST');
  console.log('API URL:', apiUrl);

  try {
    const response = await enhancedApiClient.get('shops/LIST');
    console.log('Response data:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('API error:', error);
    return { success: false, error: String(error) };
  }
}

// For debugging in the browser console
(window as any).testShopsApiConnection = testShopsApiConnection;