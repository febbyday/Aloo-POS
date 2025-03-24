/**
 * Test file to check connection to the shops API
 */
import { getApiEndpoint } from '@/lib/api/config';

// Get the API endpoint for shops
const API_URL = getApiEndpoint('shops');

/**
 * Test function to fetch shops data
 */
export async function testShopsApiConnection() {
  console.log('Testing connection to shops API...');
  console.log('API URL:', API_URL);
  
  try {
    const response = await fetch(API_URL);
    
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      return { success: true, data };
    } else {
      console.error('Error response:', await response.text());
      return { success: false, error: `HTTP error ${response.status}` };
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: String(error) };
  }
}

// For debugging in the browser console
(window as any).testShopsApiConnection = testShopsApiConnection; 