import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API configuration from environment variables
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
const API_VERSION = process.env.VITE_API_VERSION || 'v1';

async function testApi() {
  try {
    console.log('Testing API...');
    console.log(`Using API URL: ${API_URL}/api/${API_VERSION}/shops`);

    const response = await fetch(`${API_URL}/api/${API_VERSION}/shops`);
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();
